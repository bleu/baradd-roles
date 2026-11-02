import type { Cond, ConfigFile, FnRule, RuleConfig, Target } from "./types.js";

export type Direction = "widening" | "narrowing" | "neutral";

export interface DiffEntry {
  path: string;
  direction: Direction;
  message: string;
}

/**
 * Structural diff between two config files, matching rules/targets/functions
 * by name rather than position. Flags anything that widens what a rule can
 * authorize — the check `roles diff` exists for (docs/spec.md, "Tooling").
 */
export function diffConfigs(before: ConfigFile, after: ConfigFile): DiffEntry[] {
  const out: DiffEntry[] = [];
  const beforeRules = new Map(before.rule.map((r) => [r.name, r]));
  const afterRules = new Map(after.rule.map((r) => [r.name, r]));

  for (const [name, rule] of afterRules) {
    if (!beforeRules.has(name)) {
      out.push({ path: `rule[${name}]`, direction: "widening", message: "new rule added." });
    }
  }
  for (const [name] of beforeRules) {
    if (!afterRules.has(name)) {
      out.push({ path: `rule[${name}]`, direction: "narrowing", message: "rule removed." });
    }
  }
  for (const [name, a] of beforeRules) {
    const b = afterRules.get(name);
    if (b) diffRule(`rule[${name}]`, a, b, out);
  }

  return out;
}

function diffRule(path: string, a: RuleConfig, b: RuleConfig, out: DiffEntry[]) {
  if (a.mode !== b.mode) {
    out.push({ path, direction: "neutral", message: `mode changed from ${a.mode} to ${b.mode}.` });
  }
  if (a.threshold !== b.threshold) {
    out.push({
      path,
      direction: b.threshold < a.threshold ? "widening" : "narrowing",
      message: `threshold changed from ${a.threshold} to ${b.threshold}.`,
    });
  }

  const beforeSigners = new Set(a.signers);
  const afterSigners = new Set(b.signers);
  const addedSigners = b.signers.filter((s) => !beforeSigners.has(s));
  const removedSigners = a.signers.filter((s) => !afterSigners.has(s));
  if (addedSigners.length > 0 || removedSigners.length > 0) {
    out.push({
      path,
      direction: "neutral",
      message: `signers changed (+${addedSigners.length}, -${removedSigners.length}).`,
    });
  }

  const beforeTargets = new Map(a.target.map((t) => [t.contract, t]));
  const afterTargets = new Map(b.target.map((t) => [t.contract, t]));

  for (const [contract, target] of afterTargets) {
    const targetPath = `${path}.target[${target.label ?? contract}]`;
    const prior = beforeTargets.get(contract);
    if (!prior) {
      out.push({ path: targetPath, direction: "widening", message: "new target contract added." });
      continue;
    }
    diffTarget(targetPath, prior, target, out);
  }
  for (const [contract, target] of beforeTargets) {
    if (!afterTargets.has(contract)) {
      out.push({
        path: `${path}.target[${target.label ?? contract}]`,
        direction: "narrowing",
        message: "target contract removed.",
      });
    }
  }
}

function diffTarget(path: string, a: Target, b: Target, out: DiffEntry[]) {
  const beforeFns = new Map(a.fn.map((f) => [f.name, f]));
  const afterFns = new Map(b.fn.map((f) => [f.name, f]));

  for (const [name, fn] of afterFns) {
    const fnPath = `${path}.fn[${name}]`;
    const prior = beforeFns.get(name);
    if (!prior) {
      out.push({ path: fnPath, direction: "widening", message: "new function allowed." });
      continue;
    }
    diffFn(fnPath, prior, fn, out);
  }
  for (const [name] of beforeFns) {
    if (!afterFns.has(name)) {
      out.push({ path: `${path}.fn[${name}]`, direction: "narrowing", message: "function removed." });
    }
  }
}

function condKey(c: Cond): string {
  return `${c.op}:${c.arg}`;
}

function diffFn(path: string, a: FnRule, b: FnRule, out: DiffEntry[]) {
  const beforeConds = new Map(a.cond.map((c) => [condKey(c), c]));
  const afterConds = new Map(b.cond.map((c) => [condKey(c), c]));

  for (const [key, cond] of afterConds) {
    const prior = beforeConds.get(key);
    if (!prior) {
      out.push({
        path,
        direction: "narrowing",
        message: `new condition added on arg ${cond.arg} (${cond.op}): this function now accepts less than before.`,
      });
      continue;
    }
    diffCond(path, prior, cond, out);
  }
  for (const [key, cond] of beforeConds) {
    if (!afterConds.has(key)) {
      out.push({ path, direction: "widening", message: `condition removed on arg ${cond.arg} (${cond.op}): this function now accepts more than before.` });
    }
  }
}

function diffCond(path: string, a: Cond, b: Cond, out: DiffEntry[]) {
  if (a.op === "range" && b.op === "range") {
    const widenedDown = BigInt(b.min) < BigInt(a.min);
    const widenedUp = BigInt(b.max) > BigInt(a.max);
    if (widenedDown || widenedUp) {
      out.push({ path, direction: "widening", message: `range on arg ${a.arg} widened to [${b.min}, ${b.max}] (was [${a.min}, ${a.max}]).` });
    } else if (BigInt(b.min) > BigInt(a.min) || BigInt(b.max) < BigInt(a.max)) {
      out.push({ path, direction: "narrowing", message: `range on arg ${a.arg} narrowed to [${b.min}, ${b.max}] (was [${a.min}, ${a.max}]).` });
    }
  } else if (a.op === "one_of" && b.op === "one_of") {
    const beforeSet = new Set(a.values);
    const added = b.values.filter((v) => !beforeSet.has(v));
    const afterSet = new Set(b.values);
    const removed = a.values.filter((v) => !afterSet.has(v));
    if (added.length > 0) {
      out.push({ path, direction: "widening", message: `arg ${a.arg} allow-list grew by ${added.length} value(s).` });
    }
    if (removed.length > 0) {
      out.push({ path, direction: "narrowing", message: `arg ${a.arg} allow-list shrank by ${removed.length} value(s).` });
    }
  } else if (a.op === "eq" && b.op === "eq" && a.value !== b.value) {
    out.push({ path, direction: "neutral", message: `arg ${a.arg} equality value changed from ${a.value} to ${b.value}.` });
  }
}
