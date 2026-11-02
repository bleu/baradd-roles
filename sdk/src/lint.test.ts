import { describe, expect, it } from "vitest";
import { lintConfig } from "./lint.js";
import type { ConfigFile } from "./types.js";

function baseConfig(overrides: Partial<ConfigFile["rule"][number]> = {}): ConfigFile {
  return {
    account: { address: "CTREASURYACCOUNT" },
    rule: [
      {
        name: "exit-defindex",
        mode: "exit",
        threshold: 1,
        signers: ["GOP1", "GOP2"],
        target: [
          {
            contract: "CDEFINDEX",
            fn: [{ name: "withdraw", cond: [{ op: "eq_self", arg: 0 }] }],
          },
        ],
        ...overrides,
      },
    ],
  };
}

describe("lintConfig", () => {
  it("has no findings for a well-formed exit rule", () => {
    expect(lintConfig(baseConfig())).toEqual([]);
  });

  it("flags a threshold above the signer count", () => {
    const findings = lintConfig(baseConfig({ threshold: 5 }));
    expect(findings).toContainEqual(
      expect.objectContaining({ rule: "threshold-unreachable", severity: "error" }),
    );
  });

  it("flags an entry rule with a 1-signature threshold", () => {
    const findings = lintConfig(baseConfig({ mode: "entry", threshold: 1 }));
    expect(findings).toContainEqual(
      expect.objectContaining({ rule: "entry-single-signature", severity: "warn" }),
    );
  });

  it("flags a function with no conditions", () => {
    const cfg = baseConfig({
      target: [{ contract: "CDEFINDEX", fn: [{ name: "withdraw", cond: [] }] }],
    });
    const findings = lintConfig(cfg);
    expect(findings).toContainEqual(
      expect.objectContaining({ rule: "unconditional-function", severity: "warn" }),
    );
  });

  it("flags an exit function with no eq_self condition", () => {
    const cfg = baseConfig({
      target: [
        {
          contract: "CDEFINDEX",
          fn: [{ name: "withdraw", cond: [{ op: "range", arg: 1, min: "0", max: "100" }] }],
        },
      ],
    });
    const findings = lintConfig(cfg);
    expect(findings).toContainEqual(
      expect.objectContaining({ rule: "exit-without-eq-self", severity: "warn" }),
    );
  });

  it("flags duplicate target contracts", () => {
    const cfg = baseConfig({
      target: [
        { contract: "CDEFINDEX", fn: [{ name: "withdraw", cond: [{ op: "eq_self", arg: 0 }] }] },
        { contract: "CDEFINDEX", fn: [{ name: "redeem", cond: [{ op: "eq_self", arg: 0 }] }] },
      ],
    });
    const findings = lintConfig(cfg);
    expect(findings).toContainEqual(expect.objectContaining({ rule: "duplicate-target" }));
  });
});
