import { BASE_FEE, Operation, TransactionBuilder, rpc, type xdr } from "@stellar/stellar-sdk";
import { accountSpec, thresholdPolicySpec, MAX_CONTEXT_RULE_NAME_SIZE, THRESHOLD_PARAMS_TYPE } from "./account-spec";
import { signersToNative, thresholdParamsToNative } from "./native";
import type { OnchainNetworkConfig } from "./build-create-account-tx";
import type { RoleGroup } from "@/lib/types";

export interface BuildAddAdminRuleOptions extends OnchainNetworkConfig {
  accountId: string;
  /** This group's own label, e.g. "Admin" — the account's rule 0 already covers the first (e.g. "Governance") group. */
  name: string;
  group: RoleGroup;
  /** Pays the fee; must itself be able to authorize this self-call (e.g. a signer already on rule 0). */
  sourceAddress: string;
}

/** Builds the real add_context_rule transaction that installs one more Default-type (admin-capable) rule on an existing account. */
export async function buildAddAdminRuleTransaction(opts: BuildAddAdminRuleOptions): Promise<{ xdr: string }> {
  if (opts.group.signers.length === 0) {
    throw new Error("This admin role group needs at least one signer.");
  }
  if (opts.group.threshold < 1 || opts.group.threshold > opts.group.signers.length) {
    throw new Error(`threshold must be between 1 and ${opts.group.signers.length}, got ${opts.group.threshold}`);
  }
  if (new TextEncoder().encode(opts.name).length > MAX_CONTEXT_RULE_NAME_SIZE) {
    throw new Error(`Rule name is too long for the contract (max ${MAX_CONTEXT_RULE_NAME_SIZE} bytes): "${opts.name}"`);
  }

  const server = new rpc.Server(opts.rpcUrl);
  const sourceAccount = await server.getAccount(opts.sourceAddress);

  const policies = new Map<string, xdr.ScVal>();
  if (opts.group.threshold < opts.group.signers.length) {
    const thresholdParams = thresholdPolicySpec.nativeToScVal(
      thresholdParamsToNative(opts.group.threshold),
      THRESHOLD_PARAMS_TYPE,
    );
    policies.set(opts.thresholdPolicyAddress, thresholdParams);
  }

  const args = accountSpec.funcArgsToScVals("add_context_rule", {
    context_type: { tag: "Default", values: undefined },
    name: opts.name,
    valid_until: undefined,
    signers: signersToNative(opts.group.signers.map((s) => s.address)),
    policies,
  });

  const operation = Operation.invokeContractFunction({
    contract: opts.accountId,
    function: "add_context_rule",
    args,
  });

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: opts.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return { xdr: prepared.toXDR() };
}
