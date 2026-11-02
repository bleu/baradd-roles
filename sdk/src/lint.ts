import { MAX_CONDS_PER_FN, MAX_FNS_PER_TARGET, MAX_TARGETS_PER_RULE } from "./limits.js";
import type { ConfigFile, RuleConfig } from "./types.js";

export type Severity = "error" | "warn";

export interface LintFinding {
  severity: Severity;
  rule: string;
  path: string;
  message: string;
}

/**
 * Local, offline checks — no network or simulation involved. Mirrors the
 * checks `roles lint` is meant to run per docs/spec.md ("Tooling (CLI and
 * SDK)"): a threshold above the signer count, a loose rule without function
 * conditions, and an exit rule that doesn't look like it's pinned back to
 * the account itself. The last one is a heuristic, not a guarantee — it
 * can't know which argument is "the destination" for an arbitrary protocol.
 */
export function lintConfig(config: ConfigFile): LintFinding[] {
  const findings: LintFinding[] = [];

  for (const rule of config.rule) {
    const path = `rule[${rule.name}]`;
    lintThreshold(rule, path, findings);
    lintTargets(rule, path, findings);
  }

  return findings;
}

function lintThreshold(rule: RuleConfig, path: string, out: LintFinding[]) {
  if (rule.threshold > rule.signers.length) {
    out.push({
      severity: "error",
      rule: "threshold-unreachable",
      path,
      message: `threshold (${rule.threshold}) exceeds the number of signers (${rule.signers.length}): this rule can never be satisfied.`,
    });
  }
  if (rule.mode === "entry" && rule.threshold <= 1) {
    out.push({
      severity: "warn",
      rule: "entry-single-signature",
      path,
      message:
        "entry rule has a 1-signature threshold. Stellar Roles' asymmetric-threshold design expects entries to require more signatures than exits — confirm this is intentional.",
    });
  }
}

function lintTargets(rule: RuleConfig, path: string, out: LintFinding[]) {
  if (rule.target.length > MAX_TARGETS_PER_RULE) {
    out.push({
      severity: "error",
      rule: "too-many-targets",
      path,
      message: `${rule.target.length} targets exceeds the contract's limit of ${MAX_TARGETS_PER_RULE}; install will be rejected.`,
    });
  }

  const seenContracts = new Set<string>();
  for (const target of rule.target) {
    const targetPath = `${path}.target[${target.label ?? target.contract}]`;

    if (seenContracts.has(target.contract)) {
      out.push({
        severity: "warn",
        rule: "duplicate-target",
        path: targetPath,
        message: "this contract address appears more than once in the same rule; keep one block per contract.",
      });
    }
    seenContracts.add(target.contract);

    if (target.fn.length > MAX_FNS_PER_TARGET) {
      out.push({
        severity: "error",
        rule: "too-many-functions",
        path: targetPath,
        message: `${target.fn.length} functions exceeds the contract's limit of ${MAX_FNS_PER_TARGET}; install will be rejected.`,
      });
    }

    for (const fn of target.fn) {
      const fnPath = `${targetPath}.fn[${fn.name}]`;

      if (fn.cond.length > MAX_CONDS_PER_FN) {
        out.push({
          severity: "error",
          rule: "too-many-conditions",
          path: fnPath,
          message: `${fn.cond.length} conditions exceeds the contract's limit of ${MAX_CONDS_PER_FN}; install will be rejected.`,
        });
        continue;
      }

      if (fn.cond.length === 0) {
        out.push({
          severity: "warn",
          rule: "unconditional-function",
          path: fnPath,
          message: "no argument conditions: any call to this function is allowed once a rule's signature threshold is met.",
        });
      } else if (rule.mode === "exit" && !fn.cond.some((c) => c.op === "eq_self")) {
        out.push({
          severity: "warn",
          rule: "exit-without-eq-self",
          path: fnPath,
          message:
            "exit function has no eq_self condition. If one of its arguments is a destination address, verify it's pinned to the account itself — otherwise a compromised operator key could redirect funds elsewhere.",
        });
      }
    }
  }
}
