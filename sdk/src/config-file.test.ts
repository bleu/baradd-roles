import { describe, expect, it } from "vitest";
import { ConfigValidationError, parseConfigFile, stringifyConfigFile } from "./config-file.js";

const VALID_TOML = `
[account]
address = "CTREASURYACCOUNT"

[[rule]]
name = "exit-defindex"
mode = "exit"
threshold = 1
signers = ["GOPERATOR1", "GOPERATOR2"]

  [[rule.target]]
  contract = "CDEFINDEX"
  label = "DeFindex vault"

    [[rule.target.fn]]
    name = "withdraw"

      [[rule.target.fn.cond]]
      op = "eq_self"
      arg = 0
`;

describe("parseConfigFile", () => {
  it("parses a well-formed config", () => {
    const cfg = parseConfigFile(VALID_TOML);
    expect(cfg.account.address).toBe("CTREASURYACCOUNT");
    expect(cfg.rule).toHaveLength(1);
    expect(cfg.rule[0].target[0].fn[0].cond[0]).toEqual({ op: "eq_self", arg: 0 });
  });

  it("rejects a config with no rules", () => {
    expect(() => parseConfigFile('[account]\naddress = "C..."\nrule = []\n')).toThrow(
      ConfigValidationError,
    );
  });

  it("rejects a threshold of zero", () => {
    const toml = VALID_TOML.replace("threshold = 1", "threshold = 0");
    expect(() => parseConfigFile(toml)).toThrow(ConfigValidationError);
  });

  it("rejects an unknown condition op", () => {
    const toml = VALID_TOML.replace('op = "eq_self"', 'op = "always_true"');
    expect(() => parseConfigFile(toml)).toThrow(ConfigValidationError);
  });
});

describe("stringifyConfigFile", () => {
  it("round-trips a config through stringify and parse", () => {
    const original = parseConfigFile(VALID_TOML);
    const toml = stringifyConfigFile(original);
    const reparsed = parseConfigFile(toml);
    expect(reparsed).toEqual(original);
  });
});
