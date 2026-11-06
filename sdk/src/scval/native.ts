// Maps this package's TOML-shaped, snake_case/op-tagged types (src/types.ts)
// to the native, tag/values-shaped values `@stellar/stellar-sdk`'s
// `Spec.nativeToScVal` expects for the contract's `#[contracttype]`
// enums/structs — verified against the real roles-policy contract spec
// (roles-policy-spec.ts), not guessed. i128 values must be `bigint`, not
// `string` or `number` — the contract reads them as `i128`.
import type { Cond, CondValueType, FnRule, RuleConfig, Target } from "../types.js";

export interface NativeCondValue {
  tag: "U32" | "I128" | "Address" | "Symbol";
  values: [number | bigint | string];
}

export interface NativeCond {
  tag: "Eq" | "OneOf" | "EqSelf" | "Range";
  values: unknown[];
}

export interface NativeFnRule {
  name: string;
  conds: NativeCond[];
}

export interface NativeTarget {
  contract: string;
  fns: NativeFnRule[];
}

export interface NativeRolesConfig {
  mode: { tag: "Exit" | "Entry"; values: undefined };
  targets: NativeTarget[];
}

function condValueToNative(type: CondValueType, value: string): NativeCondValue {
  switch (type) {
    case "u32":
      return { tag: "U32", values: [Number(value)] };
    case "i128":
      return { tag: "I128", values: [BigInt(value)] };
    case "address":
      return { tag: "Address", values: [value] };
    case "symbol":
      return { tag: "Symbol", values: [value] };
  }
}

function condToNative(c: Cond): NativeCond {
  switch (c.op) {
    case "eq":
      return { tag: "Eq", values: [c.arg, condValueToNative(c.type, c.value)] };
    case "one_of":
      return { tag: "OneOf", values: [c.arg, c.values.map((v) => condValueToNative(c.type, v))] };
    case "eq_self":
      return { tag: "EqSelf", values: [c.arg] };
    case "range":
      return { tag: "Range", values: [c.arg, BigInt(c.min), BigInt(c.max)] };
  }
}

function fnRuleToNative(fn: FnRule): NativeFnRule {
  return { name: fn.name, conds: fn.cond.map(condToNative) };
}

function targetToNative(t: Target): NativeTarget {
  return { contract: t.contract, fns: t.fn.map(fnRuleToNative) };
}

export function ruleConfigToNativeRolesConfig(rule: RuleConfig): NativeRolesConfig {
  return {
    mode: { tag: rule.mode === "exit" ? "Exit" : "Entry", values: undefined },
    targets: rule.target.map(targetToNative),
  };
}
