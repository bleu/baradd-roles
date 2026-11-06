import type { Command } from "commander";

export function registerSimulate(program: Command) {
  program
    .command("simulate <config> <call>")
    .description("Replay a candidate call against a config using a network fork. Not implemented yet.")
    .action(() => {
      console.error(
        [
          "roles simulate is not implemented in this prototype.",
          "",
          "It needs: a Soroban RPC endpoint (or a local fork via soroban-fork), a deployed",
          "roles-policy contract address, and a funded account to replay the call against.",
          "Simulation support must be implemented before these inputs can be used.",
        ].join("\n"),
      );
      process.exitCode = 1;
    });
}
