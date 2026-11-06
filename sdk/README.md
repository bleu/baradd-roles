# @baradd/sdk

Config types, TOML parsing/validation, `lint`, and `diff` for Stellar Roles — the non-chain half of docs/spec.md's "Tooling (CLI and SDK)" section. Consumed by `@baradd/cli`.

Does not talk to a network. Reading a deployed policy's `get_config`, building install transactions with the Smart Account Kit, and simulating against a fork are not implemented here yet — see the CLI's `simulate`/`apply` commands for what that still needs.

```sh
pnpm --filter @baradd/sdk test
pnpm --filter @baradd/sdk build
```
