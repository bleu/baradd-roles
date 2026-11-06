import { BASE_FEE, Operation, TransactionBuilder, rpc, type xdr } from "@stellar/stellar-sdk";
import { installParamsToScVal } from "@baradd/sdk/scval";
import type { RuleConfig } from "@baradd/sdk";
import { accountSpec, thresholdPolicySpec, MAX_CONTEXT_RULE_NAME_SIZE, THRESHOLD_PARAMS_TYPE } from "./account-spec";
import { signersToNative, thresholdParamsToNative } from "./native";
import type { OnchainNetworkConfig } from "./build-create-account-tx";
import type { RoleGroup, Target } from "@/lib/types";

export interface BuildAddRuleOptions extends OnchainNetworkConfig {
  /** The already-deployed smart account to add this rule to. */
  accountId: string;
  /** The deployed RolesPolicy instance to install on this rule. */
  rolesPolicyAddress: string;
  /**
   * This logical rule's name. Every role group becomes its own separate
   * on-chain context rule with this exact same name — grouping them back
   * together on read relies on a local bookmark (rule-groups-store.ts), not
   * the name itself, since the contract caps names at
   * MAX_CONTEXT_RULE_NAME_SIZE bytes (too short to encode a role suffix).
   */
  name: string;
  target: Target;
  /** Exactly one of the logical rule's independent role groups — call once per enabled group. */
  group: RoleGroup;
  /** Pays the fee for this admin operation (must itself be able to authorize it, e.g. a connected governance/admin signer). */
  sourceAddress: string;
}

export interface BuildAddRuleResult {
  xdr: string;
}

/** `RolesPolicy`'s install params don't encode threshold/signers or a name — only mode+target — see sdk/src/scval/native.ts. Mode has no on-chain effect (lib/types.ts), so this is an inert constant. */
function toInstallParamsRuleConfig(name: string, target: Target): RuleConfig {
  return {
    name,
    mode: "exit",
    threshold: 0,
    signers: [],
    target: [{ contract: target.contract, label: target.label, fn: target.fns.map((fn) => ({ name: fn.name, cond: fn.conds.map(mapCond) })) }],
  };
}

function mapCond(c: Target["fns"][number]["conds"][number]) {
  switch (c.kind) {
    case "Eq":
      return { op: "eq" as const, arg: c.arg, type: c.value.kind, value: String(c.value.value) };
    case "OneOf":
      return { op: "one_of" as const, arg: c.arg, type: c.values[0].kind, values: c.values.map((v) => String(v.value)) };
    case "EqSelf":
      return { op: "eq_self" as const, arg: c.arg };
    case "Range":
      return { op: "range" as const, arg: c.arg, min: c.min, max: c.max };
  }
}

/** Builds the real add_context_rule transaction that installs a Baradd Roles rule (one role group) on an existing account, scoped to one target contract. */
export async function buildAddRuleTransaction(opts: BuildAddRuleOptions): Promise<BuildAddRuleResult> {
  if (opts.group.signers.length === 0) {
    throw new Error("This rule's signer group needs at least one signer.");
  }
  if (opts.group.threshold < 1 || opts.group.threshold > opts.group.signers.length) {
    throw new Error(`threshold must be between 1 and ${opts.group.signers.length}, got ${opts.group.threshold}`);
  }
  if (new TextEncoder().encode(opts.name).length > MAX_CONTEXT_RULE_NAME_SIZE) {
    throw new Error(`Rule name is too long for the contract (max ${MAX_CONTEXT_RULE_NAME_SIZE} bytes): "${opts.name}"`);
  }

  const server = new rpc.Server(opts.rpcUrl);
  const sourceAccount = await server.getAccount(opts.sourceAddress);

  const name = opts.name;

  const policies = new Map<string, xdr.ScVal>();
  policies.set(opts.rolesPolicyAddress, installParamsToScVal(toInstallParamsRuleConfig(name, opts.target)));
  if (opts.group.threshold < opts.group.signers.length) {
    const thresholdParams = thresholdPolicySpec.nativeToScVal(
      thresholdParamsToNative(opts.group.threshold),
      THRESHOLD_PARAMS_TYPE,
    );
    policies.set(opts.thresholdPolicyAddress, thresholdParams);
  }

  const args = accountSpec.funcArgsToScVals("add_context_rule", {
    context_type: { tag: "CallContract", values: [opts.target.contract] },
    name,
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
