import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { parseConfigFile, diffConfigs } from "@baradd/sdk";

export function registerDiff(program: Command) {
  program
    .command("diff <before> <after>")
    .description("Compare two roles config files and highlight any widening of permissions.")
    .action(async (beforePath: string, afterPath: string) => {
      const [beforeToml, afterToml] = await Promise.all([
        readFile(beforePath, "utf8"),
        readFile(afterPath, "utf8"),
      ]);

      const diff = diffConfigs(parseConfigFile(beforeToml), parseConfigFile(afterToml));

      if (diff.length === 0) {
        console.log("No differences.");
        return;
      }

      for (const entry of diff) {
        const marker = entry.direction === "widening" ? "+" : entry.direction === "narrowing" ? "-" : "~";
        console.log(`${marker} [${entry.direction}] ${entry.path}\n    ${entry.message}`);
      }

      const widening = diff.filter((d) => d.direction === "widening").length;
      console.log(`\n${diff.length} change(s), ${widening} widening permissions.`);
    });
}
