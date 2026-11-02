# Stellar Roles

> Audited permission policies for Soroban smart accounts, with asymmetric signature thresholds for entering and exiting a DeFi position.

**Status:** hypothesis to validate — pre-MVP, specification stage.

## Problem

Whoever operates a treasury must be able to reduce risk quickly with one key, but must not be able to add risk without more approvals. Stellar's classic multisig can't express that: every operation falls into one weighted threshold, so the model can't tell entering a position apart from leaving it.

On Ethereum, [Zodiac Roles](https://github.com/gnosisguild/zodiac-modifier-roles) solves this on top of Safe by scoping permissions per contract, function, and argument. Stellar has no equivalent yet. Soroban smart accounts already expose everything needed to build one: the `__check_auth` function receives the full list of authorized calls, each with its contract, function name, and arguments — making function- and argument-level policies possible. [OpenZeppelin's Stellar smart-accounts framework](https://github.com/OpenZeppelin/stellar-contracts) provides threshold and weighted-threshold policies, but (per its RC v0.7.0 audit) scopes rules only by contract address, discarding function and arguments.

## Proposal

**Stellar Roles** is a `RolesPolicy` compatible with OpenZeppelin's smart accounts, plus tooling to configure it safely:

- **Asymmetric thresholds** — exit rules need 1 signature, entry rules need M, with deny-by-default so a loose rule can never authorize an entry.
- **Function- and argument-level conditions** — equality, set membership, equality to the account's own address, and numeric ranges.
- **Protocol presets** — reviewed, ready configurations for 1–2 Stellar protocols, so a manager doesn't have to reinterpret each contract's functions from scratch.
- **Institutional-quality assurance** — external audit (via the Soroban Audit Bank, if eligible), fuzzing, invariant tests, and mainnet-fork tests.
- **Review tooling** — a CLI and SDK to define, validate, simulate, diff, and install permissions, so approvers understand what they're signing.

### Architecture

The smart account is the treasury. Each action is covered by a context rule with its own signers and policy:

- **ADMIN** (default): N-of-M governance signers — the only rule that can change rules and policies.
- **EXIT**, per target protocol: 1 operator signature, scoped to exit-only functions.
- **ENTRY**, per target protocol: M approver signatures, scoped to listed entry functions (plus the token `transfer`/`approve` calls entry requires).

`roles-policy` denies anything not explicitly allowed. Operators can only reach the EXIT rule; entries and configuration changes require more signatures.

## Repository layout (planned)

```
contracts/roles-policy/   # Soroban policy contract (Rust)
crates/roles-config/      # shared config types (no_std)
cli/                      # roles lint, simulate, diff, apply
sdk/                      # TypeScript, wraps the Smart Account Kit
tests/                    # fork tests, invariants, fuzz targets
examples/                 # demo accounts and presets
docs/                     # design, threat model, operations guide
.github/workflows/        # CI: build, test, fuzz, smoke, lint
```

## MVP scope

The MVP proves the core case — exit with 1 signature, entry with more — on a real protocol, with an auditable policy and minimal tooling to configure it:

- `RolesPolicy` with Exit and Entry modes, deny-by-default, Eq/OneOf/EqSelf/Range conditions.
- Compact events for enforcement and configuration changes.
- A CLI (`lint`, `simulate`, `diff`, `apply`) and a TypeScript SDK integrated with the Smart Account Kit.
- 1–2 presets for Stellar protocols with distinct entry and exit functions.
- Unit, property, invariant, and fork tests, with CI.
- A testnet demonstration with a real protocol, and mainnet deployment of the policy contract after audit.
- Documentation, examples, and an operations guide for managers and DAOs.

Out of scope for the MVP (phase 2): a web review UI, timelocked entries/policy changes, custom per-period caps, structured/nested argument decoding, pinning target Wasm hashes, and integrated monitoring/account hierarchies.

## Status and open questions

This is still a hypothesis under validation. Three open questions gate the project:

1. Do candidate users (asset managers, DAO treasuries, RWA issuers) want non-custodial, on-chain policy on Stellar, and would they accept it over an off-chain MPC custodian?
2. Does OpenZeppelin plan function- and argument-level conditions in its core (which would make part of this redundant)?
3. Does the [Mandate](https://github.com/script3/mandate) project already cover enough of this?

See the full proposal and specification for the threat model, competitive landscape, milestones, and budget.

## License

Licensed under the [MIT License](LICENSE).
