// Converts this app's contract-shaped types (src/lib/types.ts, PascalCase
// `kind` tags) to @baradd/sdk's CLI-config-shaped types (sdk/src/types.ts,
// snake_case `op` tags), so the UI can run the exact same `lintConfig()` and
// TOML export the CLI uses — one source of truth for what's a valid config.
//
// The CLI's RuleConfig is still a single flat signers+threshold+mode shape
// (a different product surface, not changed here) — it can't represent this
// app's independent role groups, so export only works for a rule with
// exactly one active role group; `ruleToRuleConfig` throws otherwise, and
// callers already treat that as "no export available" (see
// CreateRuleForm/DraftRulePage, which swallow it and just hide the panel).
// `mode` has no on-chain effect (see lib/types.ts) — it's synthesized here
// purely so the CLI's existing entry/exit lint heuristics still apply.
import type { ConfigFile, Cond as SdkCond, RuleConfig, Target as SdkTarget } from "@baradd/sdk";
import type { Cond, ContextRule, Target } from "./types";

function mapCond(c: Cond): SdkCond {
  switch (c.kind) {
    case "Eq":
      return { op: "eq", arg: c.arg, type: c.value.kind, value: String(c.value.value) };
    case "OneOf":
      return {
        op: "one_of",
        arg: c.arg,
        type: c.values[0].kind,
        values: c.values.map((v) => String(v.value)),
      };
    case "EqSelf":
      return { op: "eq_self", arg: c.arg };
    case "Range":
      return { op: "range", arg: c.arg, min: c.min, max: c.max };
  }
}

function mapTarget(t: Target): SdkTarget {
  return {
    contract: t.contract,
    label: t.label,
    fn: t.fns.map((fn) => ({ name: fn.name, cond: fn.conds.map(mapCond) })),
  };
}

/** Only meaningful for "Rule" kind — Admin rules have no target contract. */
export function ruleToRuleConfig(rule: ContextRule): RuleConfig {
  if (!rule.target) {
    throw new Error(`Rule "${rule.name}" has no target contract (Admin rules aren't exported).`);
  }
  if (rule.roleGroups.length !== 1) {
    throw new Error(
      `Rule "${rule.name}" has ${rule.roleGroups.length} independent signer groups — the CLI's config format only supports one.`,
    );
  }
  const [group] = rule.roleGroups;
  return {
    name: rule.name,
    mode: group.threshold <= 1 ? "exit" : "entry",
    threshold: group.threshold,
    signers: group.signers.map((s) => s.address),
    target: [mapTarget(rule.target)],
  };
}

export function accountRuleToConfigFile(accountId: string, rule: ContextRule): ConfigFile {
  return {
    account: { address: accountId },
    rule: [ruleToRuleConfig(rule)],
  };
}
