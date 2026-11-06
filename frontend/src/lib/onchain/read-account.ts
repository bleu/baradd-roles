import { Account, BASE_FEE, Contract, Networks, StrKey, TransactionBuilder, rpc, type xdr } from "@stellar/stellar-sdk";
import type { Spec } from "@stellar/stellar-sdk/contract";
import { rolesPolicySpec, ROLES_CONFIG_TYPE } from "@baradd/sdk/scval";
import { accountSpec, thresholdPolicySpec, CONTEXT_RULE_TYPE } from "./account-spec";
import { decodeRolesConfig } from "./decode-roles-config";
import type { Target } from "@/lib/types";

export interface OnchainContextType {
  tag: "Default" | "CallContract" | "CreateContract" | "CreateContractExternalRef";
  values?: unknown[];
}

export interface OnchainContextRule {
  id: number;
  name: string;
  contextType: OnchainContextType;
  signers: Array<{ tag: string; values: unknown[] }>;
  policies: string[];
  validUntil?: number;
}

// Simulation doesn't need a real, funded source account — only an
// address-shaped placeholder and a sequence number, since nothing is ever
// submitted. `Account` requires a classic G-address (it rejects a contract
// C-address), so use an all-zero Ed25519 public key rather than a contract
// address; this avoids an extra RPC round-trip to look up a real account
// just to read.
const SIMULATION_SOURCE = StrKey.encodeEd25519PublicKey(new Uint8Array(32));

async function simulateRead<T>(
  server: rpc.Server,
  networkPassphrase: string,
  contractId: string,
  fn: string,
  args: xdr.ScVal[],
  resultType: xdr.ScSpecTypeDef,
  spec: Spec = accountSpec,
): Promise<T> {
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(new Account(SIMULATION_SOURCE, "0"), {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(fn, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed for ${fn}: ${sim.error}`);
  }
  if (!sim.result) {
    throw new Error(`Simulation for ${fn} returned no result.`);
  }
  return spec.scValToNative(sim.result.retval, resultType) as T;
}

/** Reads every context rule on a deployed account, in id order (0 = admin/default rule). */
export async function getAccountRules(
  contractId: string,
  options: { rpcUrl: string; networkPassphrase?: string },
): Promise<OnchainContextRule[]> {
  const server = new rpc.Server(options.rpcUrl);
  const networkPassphrase = options.networkPassphrase ?? Networks.TESTNET;

  const u32Type = accountSpec.getFunc("get_context_rules_count").outputs[0] as unknown as xdr.ScSpecTypeDef;
  const count = await simulateRead<number>(
    server,
    networkPassphrase,
    contractId,
    "get_context_rules_count",
    [],
    u32Type,
  );

  const rules: OnchainContextRule[] = [];
  for (let id = 0; id < count; id++) {
    const idScVal = accountSpec.funcArgsToScVals("get_context_rule", { context_rule_id: id })[0];
    try {
      const rule = await simulateRead<Record<string, unknown>>(
        server,
        networkPassphrase,
        contractId,
        "get_context_rule",
        [idScVal],
        CONTEXT_RULE_TYPE,
      );
      rules.push({
        id,
        name: String(rule.name ?? ""),
        contextType: rule.context_type as OnchainContextType,
        signers: (rule.signers as OnchainContextRule["signers"]) ?? [],
        policies: (rule.policies as string[]) ?? [],
        validUntil: rule.valid_until as number | undefined,
      });
    } catch {
      // A removed rule id still counts toward get_context_rules_count (it's a
      // monotonic counter, not an active-rule count) — skip ids that no
      // longer resolve instead of failing the whole read.
      continue;
    }
  }
  return rules;
}

/** Reads a RolesPolicy instance's own installed config for one rule on one account. */
export async function getRolesConfig(
  accountId: string,
  contextRuleId: number,
  rolesPolicyAddress: string,
  options: { rpcUrl: string; networkPassphrase?: string },
): Promise<Target> {
  const server = new rpc.Server(options.rpcUrl);
  const networkPassphrase = options.networkPassphrase ?? Networks.TESTNET;
  const args = rolesPolicySpec.funcArgsToScVals("get_config", {
    smart_account: accountId,
    context_rule_id: contextRuleId,
  });
  const native = await simulateRead<Parameters<typeof decodeRolesConfig>[0]>(
    server,
    networkPassphrase,
    rolesPolicyAddress,
    "get_config",
    args,
    ROLES_CONFIG_TYPE,
    rolesPolicySpec,
  );
  return decodeRolesConfig(native);
}

/** Reads a simple_threshold policy instance's enforced threshold for one rule on one account. */
export async function getThreshold(
  accountId: string,
  contextRuleId: number,
  thresholdPolicyAddress: string,
  options: { rpcUrl: string; networkPassphrase?: string },
): Promise<number> {
  const server = new rpc.Server(options.rpcUrl);
  const networkPassphrase = options.networkPassphrase ?? Networks.TESTNET;
  const args = thresholdPolicySpec.funcArgsToScVals("get_threshold", {
    smart_account: accountId,
    context_rule_id: contextRuleId,
  });
  const u32Type = thresholdPolicySpec.getFunc("get_threshold").outputs[0] as unknown as xdr.ScSpecTypeDef;
  return simulateRead<number>(
    server,
    networkPassphrase,
    thresholdPolicyAddress,
    "get_threshold",
    args,
    u32Type,
    thresholdPolicySpec,
  );
}
