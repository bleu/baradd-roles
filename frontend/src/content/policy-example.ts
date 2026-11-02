// Verbatim from examples/defindex-exit.toml in the repository root — not
// hand-written for the page. Keep in sync if that file changes.
export const exampleToml = `# Illustrative only — CDEFINDEX/GOPERATOR* are placeholders, not real
# deployed addresses. See docs/spec.md, "Week 1", item 3: the exact function
# names and arguments still need verifying against a real DeFindex testnet
# transaction before this is used for anything but a CLI demo.

[account]
address = "CTREASURYACCOUNT"

[[rule]]
name = "exit-defindex"
mode = "exit"
threshold = 1
signers = ["GOPERATOR1", "GOPERATOR2"]

  [[rule.target]]
  contract = "CDEFINDEXVAULT"
  label = "DeFindex vault"

    [[rule.target.fn]]
    name = "withdraw"

      [[rule.target.fn.cond]]
      op = "eq_self"
      arg = 0
`;

export const examplePlainLanguage = [
  "One operator (of 2 possible signers) may call withdraw on the DeFindex vault.",
  "Argument 0 of that call must equal the account's own address — the funds can only return to the treasury.",
  "Anything else — a different function, a different contract, a different destination — is denied.",
];
