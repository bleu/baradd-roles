# @barad/cli

`roles` — the CLI from docs/spec.md's "Tooling (CLI and SDK)" section.

```sh
pnpm --filter @barad/cli exec tsx src/index.ts <command>
```

| Command | Status |
| --- | --- |
| `roles lint <config.toml>` | Works offline. Flags an unreachable threshold, a function with no argument conditions, an exit function with no `eq_self` condition, duplicate targets, and the contract's hard limits (8 targets/rule, 8 functions/target, 4 conditions/function). |
| `roles diff <before.toml> <after.toml>` | Works offline. Matches rules/targets/functions by name and flags anything that widens what a rule can authorize: a lower threshold, a new target or function, a removed condition, a widened range or allow-list. |
| `roles simulate <config> <call>` | Not implemented. Needs a Soroban RPC endpoint/fork and a deployed `roles-policy` instance. |
| `roles apply <config>` | Not implemented. Needs a deployed `roles-policy` contract address and Smart Account Kit transaction helpers. |

See `examples/*.toml` for the config file shape, and `@barad/sdk` (`../sdk`) for the underlying types, schema, lint, and diff logic.
