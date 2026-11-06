import { describe, expect, it } from "vitest";
import { lintConfig } from "@baradd/sdk";
import { accountRuleToConfigFile, ruleToRuleConfig } from "./to-sdk-config";
import { mockAccounts } from "./mock-data";
import type { ContextRule } from "./types";

const account = mockAccounts[0];
const withdrawRule = account.rules.find((r) => r.name === "Example Vault withdraw")!;
const depositRule = account.rules.find((r) => r.name === "Example Vault deposit")!;
const adminRule = account.rules.find((r) => r.kind === "Admin")!;

describe("ruleToRuleConfig", () => {
  it("maps a 1-signature rule to exit mode, with its signers and eq_self condition", () => {
    const config = ruleToRuleConfig(withdrawRule);
    expect(config.mode).toBe("exit");
    expect(config.threshold).toBe(withdrawRule.roleGroups[0].threshold);
    expect(config.signers).toEqual(withdrawRule.roleGroups[0].signers.map((s) => s.address));
    expect(config.target[0].fn[0].cond[0]).toEqual({ op: "eq_self", arg: 0 });
  });

  it("maps a >1-signature rule to entry mode, with its range condition", () => {
    const config = ruleToRuleConfig(depositRule);
    expect(config.mode).toBe("entry");
    const vaultTarget = config.target.find((t) => t.label === "Example vault")!;
    expect(vaultTarget.fn[0].cond[0]).toEqual({
      op: "range",
      arg: 1,
      min: "0",
      max: "500000000000",
    });
  });

  it("throws for a rule with no target contract (Admin)", () => {
    expect(() => ruleToRuleConfig(adminRule)).toThrow(/no target contract/);
  });

  it("throws for a rule with more than one independent signer group", () => {
    const rule: ContextRule = {
      id: 98,
      kind: "Rule",
      name: "multi-group",
      roleGroups: [
        { role: "governance", threshold: 1, signers: [{ address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }] },
        { role: "operator", threshold: 1, signers: [{ address: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" }] },
      ],
      target: { contract: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", fns: [{ name: "withdraw", conds: [] }] },
    };
    expect(() => ruleToRuleConfig(rule)).toThrow(/independent signer groups/);
  });

  it("produces a config the SDK's own lintConfig finds clean", () => {
    const configFile = accountRuleToConfigFile(account.id, withdrawRule);
    const findings = lintConfig(configFile);
    expect(findings).toEqual([]);
  });

  it("maps a OneOf condition's values", () => {
    const rule: ContextRule = {
      id: 99,
      kind: "Rule",
      name: "test",
      roleGroups: [
        {
          role: "operator",
          threshold: 2,
          signers: [{ address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }],
        },
      ],
      target: {
        contract: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        fns: [
          {
            name: "swap",
            conds: [
              {
                kind: "OneOf",
                arg: 0,
                values: [
                  { kind: "address", value: "CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" },
                  { kind: "address", value: "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" },
                ],
              },
            ],
          },
        ],
      },
    };
    const config = ruleToRuleConfig(rule);
    expect(config.target[0].fn[0].cond[0]).toEqual({
      op: "one_of",
      arg: 0,
      type: "address",
      values: [
        "CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
      ],
    });
  });
});
