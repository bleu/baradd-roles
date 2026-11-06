import { describe, expect, it } from "vitest";
import { ruleConfigToNativeRolesConfig } from "./native.js";
import type { RuleConfig } from "../types.js";

function baseRule(overrides: Partial<RuleConfig["target"][number]["fn"][number]> = {}): RuleConfig {
  return {
    name: "exit-defindex",
    mode: "exit",
    threshold: 1,
    signers: ["GOP1", "GOP2"],
    target: [
      {
        contract: "CDEFINDEX",
        fn: [{ name: "withdraw", cond: [], ...overrides }],
      },
    ],
  };
}

describe("ruleConfigToNativeRolesConfig", () => {
  it("maps mode to the Exit/Entry tag", () => {
    expect(ruleConfigToNativeRolesConfig(baseRule()).mode).toEqual({ tag: "Exit", values: undefined });
    const entry = { ...baseRule(), mode: "entry" as const };
    expect(ruleConfigToNativeRolesConfig(entry).mode).toEqual({ tag: "Entry", values: undefined });
  });

  it("maps eq_self", () => {
    const rule = baseRule({ cond: [{ op: "eq_self", arg: 0 }] });
    const native = ruleConfigToNativeRolesConfig(rule);
    expect(native.targets[0].fns[0].conds[0]).toEqual({ tag: "EqSelf", values: [0] });
  });

  it("maps eq with a u32 value to a numeric native value", () => {
    const rule = baseRule({ cond: [{ op: "eq", arg: 1, type: "u32", value: "42" }] });
    const native = ruleConfigToNativeRolesConfig(rule);
    expect(native.targets[0].fns[0].conds[0]).toEqual({
      tag: "Eq",
      values: [1, { tag: "U32", values: [42] }],
    });
  });

  it("maps eq with an address value to a string native value", () => {
    const rule = baseRule({ cond: [{ op: "eq", arg: 0, type: "address", value: "CDEST" }] });
    const native = ruleConfigToNativeRolesConfig(rule);
    expect(native.targets[0].fns[0].conds[0]).toEqual({
      tag: "Eq",
      values: [0, { tag: "Address", values: ["CDEST"] }],
    });
  });

  it("maps one_of to a list of native values", () => {
    const rule = baseRule({
      cond: [{ op: "one_of", arg: 0, type: "symbol", values: ["usdc", "xlm"] }],
    });
    const native = ruleConfigToNativeRolesConfig(rule);
    expect(native.targets[0].fns[0].conds[0]).toEqual({
      tag: "OneOf",
      values: [
        0,
        [
          { tag: "Symbol", values: ["usdc"] },
          { tag: "Symbol", values: ["xlm"] },
        ],
      ],
    });
  });

  it("maps range min/max to bigint, since the contract reads them as i128", () => {
    const rule = baseRule({ cond: [{ op: "range", arg: 1, min: "0", max: "500000000000" }] });
    const native = ruleConfigToNativeRolesConfig(rule);
    expect(native.targets[0].fns[0].conds[0]).toEqual({
      tag: "Range",
      values: [1, 0n, 500000000000n],
    });
  });

  it("maps an i128 condition value to bigint", () => {
    const rule = baseRule({ cond: [{ op: "eq", arg: 2, type: "i128", value: "9999999999" }] });
    const native = ruleConfigToNativeRolesConfig(rule);
    expect(native.targets[0].fns[0].conds[0]).toEqual({
      tag: "Eq",
      values: [2, { tag: "I128", values: [9999999999n] }],
    });
  });
});
