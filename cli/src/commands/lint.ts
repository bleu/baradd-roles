import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { ConfigValidationError, parseConfigFile, lintConfig, type LintFinding } from "@baradd/sdk";

export function registerLint(program: Command) {
  program
    .command("lint <config>")
    .description("Check a roles config file for unreachable thresholds, missing conditions, and other risks.")
    .action(async (configPath: string) => {
      const toml = await readFile(configPath, "utf8");

      let findings: LintFinding[];
      try {
        findings = lintConfig(parseConfigFile(toml));
      } catch (err) {
        if (err instanceof ConfigValidationError) {
          console.error(err.message);
          process.exitCode = 1;
          return;
        }
        throw err;
      }

      if (findings.length === 0) {
        console.log(`✓ ${configPath}: no findings.`);
        return;
      }

      for (const f of findings) {
        const marker = f.severity === "error" ? "✗" : "⚠";
        console.log(`${marker} [${f.severity}] ${f.path} (${f.rule})\n    ${f.message}`);
      }

      const errorCount = findings.filter((f) => f.severity === "error").length;
      const warnCount = findings.length - errorCount;
      console.log(`\n${errorCount} error(s), ${warnCount} warning(s).`);
      if (errorCount > 0) process.exitCode = 1;
    });
}
