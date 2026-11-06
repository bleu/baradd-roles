// Verbatim from examples/exit-vault.toml in the repository root — not
// hand-written for the page. Keep in sync if that file changes.
export const exampleToml = `# CLI demo only. CEXAMPLEVAULT/GOPERATOR* are placeholder addresses.
# Before live use, replace all addresses and verify the function name and
# argument positions against a real protocol's testnet transaction.

[account]
address = "CCHESTACCOUNT"

[[rule]]
name = "exit-vault"
mode = "exit"
threshold = 1
signers = ["GOPERATOR1", "GOPERATOR2"]

  [[rule.target]]
  contract = "CEXAMPLEVAULT"
  label = "Example vault"

    [[rule.target.fn]]
    name = "withdraw"

      [[rule.target.fn.cond]]
      op = "eq_self"
      arg = 0
`;

export const examplePlainLanguage = [
  "One operator (of 2 possible signers) may call withdraw on the example vault.",
  "Argument 0 of that call must equal the account's own address — the funds can only return to the chest.",
  "Anything else — a different function, a different contract, a different destination — is denied.",
];
