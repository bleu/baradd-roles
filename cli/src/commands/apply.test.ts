import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApplyRuleResult } from "@baradd/sdk/apply";
import { formatApplyResults, registerApply, resolveApplyOptions, type ApplyFlags } from "./apply.js";

function baseFlags(overrides: Partial<ApplyFlags> = {}): ApplyFlags {
  return {
    network: "testnet",
    policyContract: "CPOLICY",
    adminRuleId: "0",
    adminSignerEnv: [],
    rule: [],
    ...overrides,
  };
}

describe("resolveApplyOptions", () => {
  it("errors without --policy-contract", () => {
    const result = resolveApplyOptions(baseFlags({ policyContract: undefined }), {});
    expect(result).toEqual({ error: expect.stringContaining("--policy-contract") });
  });

  it("errors on a non-integer --admin-rule-id", () => {
    const result = resolveApplyOptions(baseFlags({ adminRuleId: "abc" }), {});
    expect(result).toEqual({ error: expect.stringContaining("--admin-rule-id") });
  });

  it("errors on an unknown --network", () => {
    const result = resolveApplyOptions(baseFlags({ network: "futurenet" }), {});
    expect(result).toEqual({ error: expect.stringContaining('"testnet" or "mainnet"') });
  });

  it("errors on mainnet without full manual overrides", () => {
    const result = resolveApplyOptions(baseFlags({ network: "mainnet" }), {});
    expect(result).toEqual({ error: expect.stringContaining("No verified mainnet addresses") });
  });

  it("fills in testnet defaults", () => {
    const result = resolveApplyOptions(baseFlags(), {});
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.rpcUrl).toBe("https://soroban-testnet.stellar.org");
    expect(result.policyContractAddress).toBe("CPOLICY");
    expect(result.adminRuleId).toBe(0);
    expect(result.submit).toBe(false);
  });

  it("errors when --submit is given with no --admin-signer-env", () => {
    const result = resolveApplyOptions(baseFlags({ submit: true }), {});
    expect(result).toEqual({ error: expect.stringContaining("--submit requires") });
  });

  it("errors when a named admin signer env var is missing or empty", () => {
    const result = resolveApplyOptions(
      baseFlags({ submit: true, adminSignerEnv: ["ADMIN_1", "ADMIN_2"] }),
      { ADMIN_1: "Sxxxx" },
    );
    expect(result).toEqual({ error: expect.stringContaining("ADMIN_2") });
  });

  it("resolves admin signer secrets from env, never from flags", () => {
    const result = resolveApplyOptions(
      baseFlags({ submit: true, adminSignerEnv: ["ADMIN_1"] }),
      { ADMIN_1: "SECRETVALUE" },
    );
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.adminSignerSecrets).toEqual(["SECRETVALUE"]);
    expect(result.submit).toBe(true);
  });

  it("only sets ruleNames when --rule was passed", () => {
    expect((resolveApplyOptions(baseFlags(), {}) as { ruleNames?: string[] }).ruleNames).toBeUndefined();
    const withRules = resolveApplyOptions(baseFlags({ rule: ["exit-defindex"] }), {});
    expect("error" in withRules).toBe(false);
    if (!("error" in withRules)) expect(withRules.ruleNames).toEqual(["exit-defindex"]);
  });
});

describe("formatApplyResults", () => {
  it("formats a dry-run plan", () => {
    const results: ApplyRuleResult[] = [
      {
        rule: "exit-defindex",
        kind: "dry-run",
        plan: { mode: "exit", threshold: 1, signerCount: 2, targetCount: 1, functionCount: 1, adminRuleId: 0 },
      },
    ];
    const text = formatApplyResults(results);
    expect(text).toContain("DRY RUN · exit-defindex");
    expect(text).toContain("1 of 2 signers");
    expect(text).toContain("--submit");
  });

  it("formats a successful submission", () => {
    const results: ApplyRuleResult[] = [
      { rule: "exit-defindex", kind: "submitted", result: { success: true, hash: "deadbeef", ledger: 42 } },
    ];
    expect(formatApplyResults(results)).toContain("✓ exit-defindex — submitted, tx deadbeef (ledger 42)");
  });

  it("formats a failed submission", () => {
    const results: ApplyRuleResult[] = [
      {
        rule: "exit-defindex",
        kind: "submitted",
        result: {
          success: false,
          error: { toDetailedString: () => "boom" } as never,
        },
      },
    ];
    expect(formatApplyResults(results)).toContain("✗ exit-defindex — failed\n  boom");
  });

  it("formats a skipped rule", () => {
    const results: ApplyRuleResult[] = [{ rule: "exit-defindex", kind: "skipped", reason: "no matching signers" }];
    expect(formatApplyResults(results)).toContain("⚠ exit-defindex — skipped\n  no matching signers");
  });
});

const VALID_TOML = `
[account]
address = "CTREASURYACCOUNT"

[[rule]]
name = "exit-defindex"
mode = "exit"
threshold = 1
signers = ["GOPERATOR1", "GOPERATOR2"]

  [[rule.target]]
  contract = "CDEFINDEXVAULT"

    [[rule.target.fn]]
    name = "withdraw"

      [[rule.target.fn.cond]]
      op = "eq_self"
      arg = 0
`;

describe("registerApply (command)", () => {
  let dir: string;
  let configPath: string;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "roles-apply-test-"));
    configPath = join(dir, "config.toml");
    await writeFile(configPath, VALID_TOML);
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("dry-runs by default without calling the injected apply function's network path", async () => {
    const apply = vi.fn().mockResolvedValue([
      {
        rule: "exit-defindex",
        kind: "dry-run",
        plan: { mode: "exit", threshold: 1, signerCount: 2, targetCount: 1, functionCount: 1, adminRuleId: 0 },
      },
    ] satisfies ApplyRuleResult[]);
    const program = new Command();
    registerApply(program, apply);

    await program.parseAsync(["node", "roles", "apply", configPath, "--policy-contract", "CPOLICY"]);

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0][1].submit).toBe(false);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("DRY RUN"));
    expect(process.exitCode).not.toBe(1);
    process.exitCode = 0;
  });

  it("aborts without calling apply when the config has lint errors", async () => {
    const badConfig = join(dir, "bad.toml");
    await writeFile(badConfig, VALID_TOML.replace("threshold = 1", "threshold = 99"));
    const apply = vi.fn();
    const program = new Command();
    registerApply(program, apply);

    await program.parseAsync(["node", "roles", "apply", badConfig, "--policy-contract", "CPOLICY"]);

    expect(apply).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("lint error"));
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it("aborts without calling apply when --policy-contract is missing", async () => {
    const apply = vi.fn();
    const program = new Command();
    registerApply(program, apply);

    await program.parseAsync(["node", "roles", "apply", configPath]);

    expect(apply).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("--policy-contract"));
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
