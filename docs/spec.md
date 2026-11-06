# Baradd Roles: technical specification

Baradd Roles restricts calls made by a Soroban smart account. The account decides which signatures authorize a context rule. `RolesPolicy` checks whether that rule permits the requested contract, function, and arguments.

The implementation uses OpenZeppelin's `stellar-accounts` 0.8.0. It is experimental and has not been externally audited.

## Architecture and technical specification

### Components

- [`roles-policy`](../contracts/roles-policy/src/lib.rs) implements OpenZeppelin's `Policy` trait.
- [`roles-config`](../crates/roles-config/src/lib.rs) defines the Rust configuration types and limits.
- The [TypeScript SDK](../sdk/README.md) parses configurations, checks them, compares versions, and installs policies through the Smart Account Kit.
- The [CLI](../cli/README.md) exposes configuration and installation commands.
- The [frontend](../frontend/README.md) provides a browser demo, local drafts, and testnet account and rule management.

The smart-account implementation comes from OpenZeppelin. This repository contains the permission policy, not a separate account contract.

### Permission rules and signer groups

Each account rule has its own signer set and policies. An optional `simple_threshold` policy allows M-of-N authorization; without it, all listed signers are required. `RolesPolicy` does not enforce the signature threshold.

Different rules can apply different signer groups and thresholds to functions on the same contract, with argument conditions that further restrict each permission. ENTRY and EXIT are one use case. A treasury can use the following example configuration:

| Rule | Signers | Allowed calls |
| --- | --- | --- |
| ADMIN | Governance group | Account rule and policy management |
| EXIT | Operator group, with a low threshold | Listed exit functions with destination checks |
| ENTRY | Approver group, with a higher threshold | Listed entry functions and required token operations |

These are example rule names. Signer groups are independent and can overlap. Different groups can authorize the same action through separate context rules. One group does not inherit another group's permissions.

`RolesConfig.mode` is `Exit` or `Entry`. This field describes the configuration; it does not set a signature threshold or establish whether a call adds or removes financial risk. The configured targets and conditions control which calls pass.

The frontend creates a `CallContract` context rule for one target contract per role group and adds `simple_threshold` when fewer than all signers are required. The SDK's `apply` operation creates a `Default` context rule and installs `RolesPolicy` with the supplied targets, but does not install a threshold policy. The TOML `threshold` is checked and shown in the plan, but submission does not apply it; the resulting rule requires all listed signers. These are different installation paths; inspect the resulting account rules when choosing one.

### Evaluation (`enforce`)

For each authorization context, the policy:

1. Requires authorization from the smart account and loads the configuration for the account and context-rule ID.
2. Rejects contexts other than contract calls.
3. Finds the first configured target with the requested contract address.
4. Finds the first configured function with the requested name.
5. Checks every condition on that function.
6. Emits an enforcement event if the checks pass.

An absent configuration, unknown target, unknown function, or failed condition aborts the transaction. A listed function with no conditions allows any arguments. Duplicate target or function entries do not merge their permissions.

### Configuration and interface

A configuration has a mode and a list of targets. Each target has a contract address and function rules. Each function rule has a name and argument conditions.

| Condition | Check |
| --- | --- |
| `Eq` | The argument equals a configured typed value |
| `OneOf` | The argument equals one value in a configured set |
| `EqSelf` | The argument is the smart account's address |
| `Range` | The `i128` argument is within the inclusive minimum and maximum |

Configured comparison values support `u32`, `i128`, address, and symbol types. The argument index and type must match the target contract's interface.

The contract implements these policy entrypoints:

- `install(e, install_params: RolesConfig, context_rule: ContextRule, smart_account: Address)` stores a new configuration. It rejects an existing configuration and configurations above the limits.
- `enforce(e, context: Context, authenticated_signers: Vec<Signer>, context_rule: ContextRule, smart_account: Address)` checks the call. Signature threshold checks belong to the account; this policy does not count signers.
- `uninstall(e, context_rule: ContextRule, smart_account: Address)` removes the configuration. It rejects a missing configuration.
- `get_config(e, smart_account: Address, context_rule_id: u32) -> RolesConfig` reads the installed configuration.

The policy trait entrypoints require smart-account authorization. See the [contract source](../contracts/roles-policy/src/lib.rs) for the exact Rust signatures and error behavior.

The SDK and CLI use TOML files with `[account]`, `[[rule]]`, target, and function entries. See the [example configurations](../examples/) for the file format. Example contract addresses and protocol functions are placeholders, not verified integrations.

### Storage, limits and costs

Configurations use persistent storage keyed by smart-account address and context-rule ID. Each configuration permits at most:

- 8 targets.
- 8 functions per target.
- 4 conditions per function.

Reads through `get_config` and `enforce` extend the configuration's storage TTL. The threshold is 29 days and the extension is 30 days, calculated at 17,280 ledgers per day. The contract has no separate administrative TTL-extension function.

Events record installation, successful enforcement, and removal. Enforcement events include the account, rule ID, contract, and function. They omit call arguments.

### Tooling (CLI and SDK)

| Command | Behavior |
| --- | --- |
| `roles lint <config.toml>` | Checks local configuration limits and reports errors and permission warnings |
| `roles diff <before.toml> <after.toml>` | Compares local configurations and reports permission changes |
| `roles apply <config.toml>` | Produces a local installation plan by default; `--submit` signs and submits installation through the Smart Account Kit |
| `roles simulate <config> <call>` | Not implemented |

Lint reports unreachable thresholds and configuration-limit errors. Its warnings include entry rules with one signature, functions without conditions, exit functions without `EqSelf`, and duplicate targets. These checks are configuration checks, not proof that a protocol integration is safe.

Diff compares rules, thresholds, targets, functions, and conditions. It classifies structural changes as widening, narrowing, or neutral. It does not compare live account state or determine the financial effect of a call.

`apply` requires the policy contract address. Submission also requires existing administrative signer keys supplied through environment variables. Those keys authorize installation; the new rule's signers do not authorize its creation. Dry-run mode does not make an RPC call or construct a transaction. See the [CLI usage](../cli/README.md) for flags.

### Compatibility and versions

The Rust policy depends on `stellar-accounts` 0.8.0. Dependency versions are recorded in the workspace manifests and lockfiles. CI runs Rust tests and a Wasm build, plus workspace lint, tests, builds, and frontend claim checks. CI does not run the Playwright browser suite.

## Threat model and security

The policy denies calls outside the installed configuration. Its protection depends on the complete account configuration and the behavior of the target contracts.

| Risk | Boundary or control |
| --- | --- |
| Compromised operator key | The signer can use every call allowed by its account rules. Exit rules need explicit function and destination restrictions. |
| Forced exits | A valid exit signer can force permitted exits. The policy has no timelock or per-period cap. |
| Another rule permits the same call | `RolesPolicy` cannot restrict a separate rule. Review all account rules, including default rules. |
| Wrong argument index or missing condition | The configured check can protect the wrong value or leave arguments unrestricted. Check the target contract interface. |
| Token transfer or approval sub-invocation | Each required authorization must have an appropriate account rule and policy. Protocol function names alone do not define fund flow. |
| Target contract upgrade | An address restriction does not pin the target's Wasm hash or behavior. |
| Unauthorized policy changes | Installation and removal require smart-account authorization. The account's administrative rules must be configured correctly. |
| Storage expiry | Configuration reads extend TTL. A missing configuration causes enforcement to fail. |
| Large configuration | The policy applies the 8-target, 8-function, and 4-condition limits. |

## Current scope and limits

The policy supports the four argument conditions above, local configuration checks, structural diffs, and policy installation. The frontend implements testnet account creation, account reads, and rule creation with wallet signing.

Protocol presets are illustrative, not verified integrations. Candidate-call simulation through `roles simulate`, nested argument decoding, target Wasm-hash pinning, timelocks, and per-period caps are not implemented. RPC simulation is used for frontend reads and transaction preparation. The frontend's DeFi action buttons do not execute protocol transactions. Mainnet is disabled in the frontend.

## References

- [OpenZeppelin smart accounts](https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/accounts)
- [Context rules](https://docs.openzeppelin.com/stellar-contracts/accounts/context-rules)
- [Policies](https://docs.openzeppelin.com/stellar-contracts/accounts/policies)
- [Stellar Smart Account Kit](https://github.com/stellar/smart-account-kit)
- [Soroban authorization types](https://docs.rs/soroban-sdk/latest/src/soroban_sdk/auth.rs.html)
