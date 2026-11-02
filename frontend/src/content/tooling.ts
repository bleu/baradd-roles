// Captured by actually running the commands (2026-11-03), not written by
// hand, per spec section 7.7. Re-capture if examples/*.toml or the CLI's
// output format changes.
export const lintOutput = {
  command: "roles lint examples/defindex-exit.toml",
  output: "✓ examples/defindex-exit.toml: no findings.",
};

export const diffOutput = {
  command: "roles diff examples/defindex-entry.toml examples/defindex-entry-widened.toml",
  output: `+ [widening] rule[entry-defindex]
    threshold changed from 2 to 1.
+ [widening] rule[entry-defindex].target[DeFindex vault].fn[deposit]
    range on arg 1 widened to [0, 5000000000000] (was [0, 500000000000]).

2 change(s), 2 widening permissions.`,
};

export const comingTools = [
  { name: "roles simulate", need: "a Soroban RPC endpoint (or a local fork) and a deployed roles-policy instance" },
  { name: "roles apply", need: "a deployed roles-policy contract address and Smart Account Kit transaction helpers" },
];
