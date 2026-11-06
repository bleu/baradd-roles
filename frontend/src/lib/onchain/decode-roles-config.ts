// Inverse of sdk/src/scval/native.ts's ruleConfigToNativeRolesConfig: turns
// the native value decoded off-chain (via rolesPolicySpec.scValToNative) back
// into this app's frontend Target shape (src/lib/types.ts), so a real
// on-chain rule's policy can render through the same PolicyView component
// the draft flow uses. The deployed RolesPolicy's own stored type still has
// `mode` and `targets: Vec<Target>` (it's the already-deployed contract's
// struct, unchanged) — `mode` is discarded (inert, see lib/types.ts) and this
// app only ever installs exactly one target, so only the first is read.
import type { Cond, CondValue, FnRule, Target } from "@/lib/types";

interface NativeTagged {
  tag: string;
  values?: unknown[];
}

function decodeCondValue(v: NativeTagged): CondValue {
  const value = v.values?.[0];
  switch (v.tag) {
    case "U32":
      return { kind: "u32", value: Number(value) };
    case "I128":
      return { kind: "i128", value: String(value) };
    case "Address":
      return { kind: "address", value: String(value) };
    case "Symbol":
      return { kind: "symbol", value: String(value) };
    default:
      throw new Error(`Unknown CondValue tag: ${v.tag}`);
  }
}

function decodeCond(c: NativeTagged): Cond {
  const values = c.values ?? [];
  switch (c.tag) {
    case "Eq":
      return { kind: "Eq", arg: values[0] as number, value: decodeCondValue(values[1] as NativeTagged) };
    case "OneOf":
      return {
        kind: "OneOf",
        arg: values[0] as number,
        values: (values[1] as NativeTagged[]).map(decodeCondValue),
      };
    case "EqSelf":
      return { kind: "EqSelf", arg: values[0] as number };
    case "Range":
      return { kind: "Range", arg: values[0] as number, min: String(values[1]), max: String(values[2]) };
    default:
      throw new Error(`Unknown Cond tag: ${c.tag}`);
  }
}

function decodeFnRule(fn: { name: string; conds: NativeTagged[] }): FnRule {
  return { name: fn.name, conds: fn.conds.map(decodeCond) };
}

export function decodeRolesConfig(native: {
  mode: NativeTagged;
  targets: { contract: string; fns: { name: string; conds: NativeTagged[] }[] }[];
}): Target {
  const [target] = native.targets;
  if (!target) throw new Error("RolesPolicy config has no target.");
  return { contract: target.contract, fns: target.fns.map(decodeFnRule) };
}
