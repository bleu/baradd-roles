// Builds and (optionally) submits the real "create a context rule and
// install RolesPolicy on it" transaction via smart-account-kit. See
// docs/validations.md / the plan this was built from for how the pieces
// here were verified against the kit's actual API, not guessed:
// - kit.rules.add() creates the context rule AND installs every policy in
//   `policies` in the same call — there's no separate install step.
// - The context type is always Default: an Exit/Entry rule's targets can
//   span multiple contracts, and CallContract(address) only matches one.
//   RolesPolicy.enforce does the real per-contract/function/argument
//   scoping, not the outer context type.
// - Creating/changing a rule is an account mutation, so it must go through
//   kit.multiSigners.adminOperation() with the account's EXISTING admin
//   rule's signers — never the new rule's own signers, which only govern
//   who can use the rule afterward.
import {
  SmartAccountKit,
  createDefaultContext,
  createDelegatedSigner,
  MAX_NAME_SIZE,
  type TransactionResult,
} from "smart-account-kit";
import type { ConfigFile, RuleConfig } from "../types.js";
import { installParamsToScVal } from "../scval/install-params.js";

export interface ApplyOptions {
  rpcUrl: string;
  networkPassphrase: string;
  accountWasmHash: string;
  webauthnVerifierAddress: string;
  ed25519VerifierAddress: string;
  /** The deployed roles-policy contract instance to install on each rule. */
  policyContractAddress: string;
  /** Which existing context rule's signers must co-sign this change. */
  adminRuleId: number;
  /** Secret keys (S...) of the admin rule's signers who will co-sign. */
  adminSignerSecrets: string[];
  /** Apply only these [[rule]] names. Default: all rules in the file. */
  ruleNames?: string[];
  /** Actually sign and submit. Default: dry run (build the plan only). */
  submit?: boolean;
}

export interface ApplyPlan {
  mode: "exit" | "entry";
  threshold: number;
  signerCount: number;
  targetCount: number;
  functionCount: number;
  adminRuleId: number;
}

export type ApplyRuleResult =
  | { rule: string; kind: "dry-run"; plan: ApplyPlan }
  | { rule: string; kind: "submitted"; result: TransactionResult }
  | { rule: string; kind: "skipped"; reason: string };

function buildPlan(rule: RuleConfig, adminRuleId: number): ApplyPlan {
  return {
    mode: rule.mode,
    threshold: rule.threshold,
    signerCount: rule.signers.length,
    targetCount: rule.target.length,
    functionCount: rule.target.reduce((n, t) => n + t.fn.length, 0),
    adminRuleId,
  };
}

function selectRules(config: ConfigFile, ruleNames?: string[]): RuleConfig[] {
  if (!ruleNames || ruleNames.length === 0) return config.rule;
  return config.rule.filter((r) => ruleNames.includes(r.name));
}

export async function applyConfig(config: ConfigFile, options: ApplyOptions): Promise<ApplyRuleResult[]> {
  const rules = selectRules(config, options.ruleNames);
  const results: ApplyRuleResult[] = [];

  for (const rule of rules) {
    if (new TextEncoder().encode(rule.name).length > MAX_NAME_SIZE) {
      results.push({
        rule: rule.name,
        kind: "skipped",
        reason: `rule name exceeds the contract's ${MAX_NAME_SIZE}-byte limit`,
      });
    }
  }
  const applicable = rules.filter((r) => !results.some((res) => res.rule === r.name));

  if (!options.submit) {
    for (const rule of applicable) {
      results.push({ rule: rule.name, kind: "dry-run", plan: buildPlan(rule, options.adminRuleId) });
    }
    return results;
  }

  const kit = new SmartAccountKit({
    rpcUrl: options.rpcUrl,
    networkPassphrase: options.networkPassphrase,
    accountWasmHash: options.accountWasmHash,
    webauthnVerifierAddress: options.webauthnVerifierAddress,
    ed25519VerifierAddress: options.ed25519VerifierAddress,
  });

  const connection = await kit.connectWallet({ contractId: config.account.address });
  if (!connection) {
    throw new Error(`Could not connect to smart account ${config.account.address}.`);
  }

  for (const secret of options.adminSignerSecrets) {
    kit.externalSigners.addEd25519FromSecret(secret);
  }

  for (const rule of applicable) {
    const policies = new Map<string, unknown>([[options.policyContractAddress, installParamsToScVal(rule)]]);
    const signers = rule.signers.map(createDelegatedSigner);

    const tx = await kit.rules.add(createDefaultContext(), rule.name, signers, policies);

    const available = await kit.multiSigners.getAvailableSigners();
    const selected = kit.multiSigners.buildSelectedSigners(available);
    if (selected.length === 0) {
      results.push({
        rule: rule.name,
        kind: "skipped",
        reason: "none of the supplied admin signer secrets match a signer on the admin rule",
      });
      continue;
    }

    const result = await kit.multiSigners.adminOperation(tx, selected, {
      resolveContextRuleIds: () => [options.adminRuleId],
    });
    results.push({ rule: rule.name, kind: "submitted", result });
  }

  return results;
}
