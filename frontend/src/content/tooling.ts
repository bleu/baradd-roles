// Captured by actually running the commands (2026-11-05), not written by
// hand, per spec section 7.7. Re-capture if examples/*.toml or the CLI's
// output format changes.
export const lintOutput = {
  command: "roles lint examples/exit-vault.toml",
  output: "✓ examples/exit-vault.toml: no findings.",
};

export const diffOutput = {
  command: "roles diff examples/entry-vault.toml examples/entry-vault-widened.toml",
  output: `+ [widening] rule[entry-vault]
    threshold changed from 2 to 1.
+ [widening] rule[entry-vault].target[Example vault].fn[deposit]
    range on arg 1 widened to [0, 5000000000000] (was [0, 500000000000]).

2 change(s), 2 widening permissions.`,
};

export const comingTools = [
  { name: "roles simulate", need: "a Soroban RPC endpoint (or a local fork) and a deployed roles-policy instance" },
  { name: "roles apply", need: "a deployed roles-policy contract address and Smart Account Kit transaction helpers" },
];

export const toolStatus = [
  { command: "roles lint", works: true },
  { command: "roles diff", works: true },
  { command: comingTools[0].name, works: false },
  { command: comingTools[1].name, works: false },
];
