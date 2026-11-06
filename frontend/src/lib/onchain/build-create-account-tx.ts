import { Address, BASE_FEE, Operation, TransactionBuilder, rpc, type xdr } from "@stellar/stellar-sdk";
import { accountSpec, thresholdPolicySpec, THRESHOLD_PARAMS_TYPE } from "./account-spec";
import { signersToNative, thresholdParamsToNative } from "./native";
import { deriveContractId, hexToBytes, randomSalt } from "./contract-id";
import type { RoleGroup } from "@/lib/types";

export interface OnchainNetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  accountWasmHash: string;
  thresholdPolicyAddress: string;
}

export interface BuildCreateAccountOptions extends OnchainNetworkConfig {
  /** At least one — the first becomes the account's rule 0 at construction; any more must be added afterward via buildAddAdminRuleTransaction. */
  roleGroups: RoleGroup[];
  /** Pays the deploy fee and derives the new contract's address (with the salt). */
  sourceAddress: string;
}

export interface BuildCreateAccountResult {
  /** Unsigned, simulated/prepared transaction XDR, ready for signAndSubmit. */
  xdr: string;
  /** The new account's address — deterministic from sourceAddress + salt, known before submission. */
  contractId: string;
  /** Role groups beyond the first, each needing its own buildAddAdminRuleTransaction call once the account exists. */
  pendingGroups: RoleGroup[];
}

/** Builds the real CreateContractV2 transaction that deploys a smart account with its first role group as rule 0. */
export async function buildCreateAccountTransaction(
  opts: BuildCreateAccountOptions,
): Promise<BuildCreateAccountResult> {
  const [first, ...pendingGroups] = opts.roleGroups;
  if (!first || first.signers.length === 0) {
    throw new Error("At least one role group with at least one signer is required.");
  }
  if (first.threshold < 1 || first.threshold > first.signers.length) {
    throw new Error(`threshold must be between 1 and ${first.signers.length}, got ${first.threshold}`);
  }

  const server = new rpc.Server(opts.rpcUrl);
  const sourceAccount = await server.getAccount(opts.sourceAddress);

  const policies = new Map<string, xdr.ScVal>();
  if (first.threshold < first.signers.length) {
    const installParams = thresholdPolicySpec.nativeToScVal(
      thresholdParamsToNative(first.threshold),
      THRESHOLD_PARAMS_TYPE,
    );
    policies.set(opts.thresholdPolicyAddress, installParams);
  }

  const constructorArgs = accountSpec.funcArgsToScVals("__constructor", {
    signers: signersToNative(first.signers.map((s) => s.address)),
    policies,
  });

  const salt = randomSalt();
  const contractId = deriveContractId(opts.sourceAddress, salt, opts.networkPassphrase);

  const operation = Operation.createCustomContract({
    address: Address.fromString(opts.sourceAddress),
    wasmHash: hexToBytes(opts.accountWasmHash),
    constructorArgs,
    salt,
  });

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: opts.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return { xdr: prepared.toXDR(), contractId, pendingGroups };
}
