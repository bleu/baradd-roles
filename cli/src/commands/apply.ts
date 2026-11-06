import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { ConfigValidationError, parseConfigFile, lintConfig, type ConfigFile } from "@baradd/sdk";
import { applyConfig, type ApplyOptions, type ApplyRuleResult } from "@baradd/sdk/apply";

// Sourced from smart-account-kit's docs/deployments-stellar-accounts-0.8-2026-10-25.md,
// version-matched to this repo's own `stellar-accounts = "0.8.0"` pin
// (contracts/roles-policy/Cargo.toml). No mainnet addresses have been
// verified, so `--network mainnet` requires every override explicitly.
const TESTNET_DEFAULTS = {
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; September 2015",
  accountWasmHash: "c514d35ea67eaea9bfc1fb3327854c0c06111bc1ddebd4fe217c504c1004b9e1",
  webauthnVerifierAddress: "CC7EKIHQP3TN4CARQDND6CEOY2UXLWWC2X5GHTD5NLAT7BG5GPZIOM3F",
  ed25519VerifierAddress: "CAAVTMCBXEIBPR64EAASKFXERVPYFZA2JYP5A3BG6PESWEFUJX5IHKN4",
};

export interface ApplyFlags {
  network: string;
  policyContract?: string;
  adminRuleId: string;
  adminSignerEnv: string[];
  rule: string[];
  rpcUrl?: string;
  networkPassphrase?: string;
  accountWasmHash?: string;
  webauthnVerifier?: string;
  ed25519Verifier?: string;
  submit?: boolean;
}

export function collectRepeatable(value: string, previous: string[]): string[] {
  return [...previous, value];
}

/** Resolves CLI flags + named env vars into real ApplyOptions, or a user-facing error. */
export function resolveApplyOptions(
  flags: ApplyFlags,
  env: Record<string, string | undefined>,
): ApplyOptions | { error: string } {
  if (!flags.policyContract) {
    return { error: "Missing --policy-contract <address> (the deployed roles-policy instance)." };
  }

  const adminRuleId = Number(flags.adminRuleId);
  if (!Number.isInteger(adminRuleId) || adminRuleId < 0) {
    return { error: `--admin-rule-id must be a non-negative integer, got "${flags.adminRuleId}".` };
  }

  const defaults = flags.network === "testnet" ? TESTNET_DEFAULTS : undefined;
  if (flags.network !== "testnet" && flags.network !== "mainnet") {
    return { error: `--network must be "testnet" or "mainnet", got "${flags.network}".` };
  }

  const rpcUrl = flags.rpcUrl ?? defaults?.rpcUrl;
  const networkPassphrase = flags.networkPassphrase ?? defaults?.networkPassphrase;
  const accountWasmHash = flags.accountWasmHash ?? defaults?.accountWasmHash;
  const webauthnVerifierAddress = flags.webauthnVerifier ?? defaults?.webauthnVerifierAddress;
  const ed25519VerifierAddress = flags.ed25519Verifier ?? defaults?.ed25519VerifierAddress;

  if (!rpcUrl || !networkPassphrase || !accountWasmHash || !webauthnVerifierAddress || !ed25519VerifierAddress) {
    return {
      error:
        "No verified mainnet addresses are baked in yet. Pass --rpc-url, --network-passphrase, " +
        "--account-wasm-hash, --webauthn-verifier, and --ed25519-verifier explicitly.",
    };
  }

  if (flags.submit && flags.adminSignerEnv.length === 0) {
    return { error: "--submit requires at least one --admin-signer-env <VAR>." };
  }

  const adminSignerSecrets: string[] = [];
  const missing: string[] = [];
  for (const name of flags.adminSignerEnv) {
    const value = env[name];
    if (!value) missing.push(name);
    else adminSignerSecrets.push(value);
  }
  if (missing.length > 0) {
    return { error: `Missing or empty environment variable(s): ${missing.join(", ")}.` };
  }

  return {
    rpcUrl,
    networkPassphrase,
    accountWasmHash,
    webauthnVerifierAddress,
    ed25519VerifierAddress,
    policyContractAddress: flags.policyContract,
    adminRuleId,
    adminSignerSecrets,
    ruleNames: flags.rule.length > 0 ? flags.rule : undefined,
    submit: flags.submit ?? false,
  };
}

export function formatApplyResults(results: ApplyRuleResult[]): string {
  if (results.length === 0) return "No matching [[rule]] blocks to apply.";

  const lines: string[] = [];
  for (const r of results) {
    switch (r.kind) {
      case "dry-run":
        lines.push(
          `DRY RUN · ${r.rule}\n` +
            `  ${r.plan.mode} rule, ${r.plan.threshold} of ${r.plan.signerCount} signers, ` +
            `${r.plan.targetCount} target(s), ${r.plan.functionCount} function(s)\n` +
            `  needs admin rule #${r.plan.adminRuleId}'s signers to co-sign — pass --submit with ` +
            `--admin-signer-env to actually install this.`,
        );
        break;
      case "submitted":
        if (r.result.success) {
          lines.push(
            `✓ ${r.rule} — submitted, tx ${r.result.hash}${r.result.ledger ? ` (ledger ${r.result.ledger})` : ""}`,
          );
        } else {
          lines.push(`✗ ${r.rule} — failed\n  ${r.result.error.toDetailedString()}`);
        }
        break;
      case "skipped":
        lines.push(`⚠ ${r.rule} — skipped\n  ${r.reason}`);
        break;
    }
  }
  return lines.join("\n\n");
}

async function readConfig(configPath: string): Promise<ConfigFile | { error: string }> {
  const toml = await readFile(configPath, "utf8");
  try {
    return parseConfigFile(toml);
  } catch (err) {
    if (err instanceof ConfigValidationError) return { error: err.message };
    throw err;
  }
}

export function registerApply(program: Command, apply: typeof applyConfig = applyConfig) {
  program
    .command("apply <config>")
    .description(
      "Build (and, with --submit, sign and send) the transaction that creates a context rule and " +
        "installs RolesPolicy on it, via the Smart Account Kit. Without --submit, prints the plan only.",
    )
    .option("--network <network>", "testnet or mainnet", "testnet")
    .option("--policy-contract <address>", "deployed roles-policy contract address (required)")
    .option("--admin-rule-id <id>", "context rule id whose signers authorize this change", "0")
    .option(
      "--admin-signer-env <VAR>",
      "name of an env var holding an admin co-signer's secret key (repeatable)",
      collectRepeatable,
      [] as string[],
    )
    .option("--rule <name>", "apply only this [[rule]] block (repeatable); default: all", collectRepeatable, [] as string[])
    .option("--rpc-url <url>", "override the network's RPC URL")
    .option("--network-passphrase <passphrase>", "override the network passphrase")
    .option("--account-wasm-hash <hash>", "override the smart account WASM hash")
    .option("--webauthn-verifier <address>", "override the WebAuthn verifier contract address")
    .option("--ed25519-verifier <address>", "override the Ed25519 verifier contract address")
    .option("--submit", "actually sign and submit (default: dry run — build and print the plan only)")
    .action(async (configPath: string, flags: ApplyFlags) => {
      const config = await readConfig(configPath);
      if ("error" in config) {
        console.error(config.error);
        process.exitCode = 1;
        return;
      }

      const findings = lintConfig(config);
      const errors = findings.filter((f) => f.severity === "error");
      if (errors.length > 0) {
        console.error(
          `${configPath} has ${errors.length} lint error(s) — run \`roles lint ${configPath}\` and fix them before applying.`,
        );
        process.exitCode = 1;
        return;
      }

      const resolved = resolveApplyOptions(flags, process.env);
      if ("error" in resolved) {
        console.error(resolved.error);
        process.exitCode = 1;
        return;
      }

      const results = await apply(config, resolved);
      console.log(formatApplyResults(results));

      const failed = results.some((r) => r.kind === "skipped" || (r.kind === "submitted" && !r.result.success));
      if (failed) process.exitCode = 1;
    });
}
