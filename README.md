# Baradd Roles

Baradd Roles is a permission policy for Soroban smart accounts, with a TypeScript SDK, CLI, and treasury wallet interface. It lets one account use different signer groups and thresholds for different actions.

The account checks signatures; `RolesPolicy` restricts the contracts, functions, and arguments each rule allows. Different rules can require different signer groups and thresholds, including for calls to the same contract. ENTRY and EXIT are examples of this model: a treasury can allow one operator to exit a DeFi position while requiring more signatures to enter it.

This is experimental software. It has not been externally audited and is not ready for production funds.

## Permission model

The smart account holds the funds. Each context rule has its own signers and policies. A threshold policy allows M-of-N authorization; without one, all listed signers are required. Signer groups are independent; an address can belong to more than one group.

An example configuration uses three groups:

| Group | Permission | Example threshold |
| --- | --- | --- |
| ADMIN | Change account rules and policies | 2 governance signatures |
| EXIT | Call listed exit functions, with funds returned to the treasury | 1 operator signature |
| ENTRY | Call listed entry functions and required token operations | 3 approver signatures |

These names and thresholds describe a configuration, not fixed roles built into the policy. The installed rules determine who can act.

`RolesPolicy` denies calls that do not match the configured contract and function. It checks every argument condition on a matching function:

- `Eq`: the argument equals a configured value.
- `OneOf`: the argument is in an allowed set.
- `EqSelf`: the argument equals the smart account address.
- `Range`: an integer argument is within the configured bounds.

An exit rule must be configured for the target protocol's actual calls. The policy does not infer whether a function reduces financial risk.

## Current state

The repository contains the following capabilities:

| Component | State |
| --- | --- |
| Soroban policy | Implements OpenZeppelin's `Policy` trait, with unit and property tests |
| SDK and CLI | Local TOML parsing, lint, diff, and policy installation through the Smart Account Kit |
| Candidate-call simulation (`roles simulate`) | Not implemented |
| Treasury interface | Testnet account reads, account creation, and rule creation with wallet signing; also includes local drafts and example data |
| Interactive website demo | Runs in the browser without a wallet or network |
| DeFi actions | Protocol action buttons do not execute transactions; protocol presets are not verified integrations |
| Mainnet and audit | Mainnet is disabled in the frontend; no external audit has been completed |

The SDK/CLI installer currently installs the permission policy without a threshold policy. Its submitted rules require all listed signers, even when the TOML file specifies a lower threshold. The frontend's rule-creation path supports lower thresholds.

See the [technical specification](docs/spec.md) for contract behavior, configuration limits, and security boundaries. The [CLI](cli/README.md), [SDK](sdk/README.md), and [frontend](frontend/README.md) each have their own usage notes.

## Repository layout

```text
contracts/roles-policy/   Soroban permission policy
crates/roles-config/      Shared Rust configuration types
sdk/                     TypeScript configuration and transaction tools
cli/                     roles lint, diff, simulate, and apply
frontend/                Next.js website and treasury interface
examples/                Example TOML configurations
docs/spec.md             Technical specification and threat model
.github/workflows/       Continuous integration
```

## Development

The SDK, CLI, and frontend use a pnpm workspace. Run these commands from the repository root:

```sh
pnpm install
pnpm build
pnpm test
pnpm lint
```

The contracts use a Cargo workspace:

```sh
cargo test --workspace
```

See [examples](examples/) for configuration files. Example addresses and protocol functions are illustrative unless stated otherwise.

## Security limits

A policy only restricts the rules on which it is installed. Another permissive rule can authorize the same call. Review the whole account configuration, including its default rule.

A compromised exit signer can still force permitted exits. Contract and function restrictions do not protect against price changes, a target protocol upgrade, or an incorrect configuration. Do not treat a permitted call as proof that it is financially safe.

## License

[MIT](LICENSE).

Baradd is an independent project built on Stellar and OpenZeppelin's `stellar-accounts`. It is not endorsed by the Stellar Development Foundation or OpenZeppelin. It is not financial advice.
