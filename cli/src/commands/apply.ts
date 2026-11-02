import type { Command } from "commander";

export function registerApply(program: Command) {
  program
    .command("apply <config>")
    .description("Generate rule-creation and policy-installation transactions for the Smart Account Kit. Not implemented yet.")
    .action(() => {
      console.error(
        [
          "roles apply is not implemented in this prototype.",
          "",
          "It needs a deployed roles-policy contract address (build one with",
          "`stellar contract build` from contracts/roles-policy and deploy it to testnet),",
          "and the Smart Account Kit's transaction-building helpers to wire the install",
          "call up for a wallet to sign. See docs/spec.md, \"MVP scope\".",
        ].join("\n"),
      );
      process.exitCode = 1;
    });
}
