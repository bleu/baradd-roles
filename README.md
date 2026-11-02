# Barad

> A treasury wallet for Soroban smart accounts, built on **Barad Roles**: permission policies, implemented and tested but not yet audited, with asymmetric signature thresholds for entering and exiting a DeFi position.

*Barad* is Sindarin for "tower," also glossed "fort, fortress" ([Eldamo](https://elfdict.com/w/barad/s)).

**Status: early prototype, running on demo data.** The policy contract is implemented and tested (14 tests) against a real dependency version, not yet audited or deployed; the CLI's `lint`/`diff` commands work offline; the frontend is a working UI shell over illustrative data, not a live treasury. See [Status](#status-and-whats-next) below for what's real versus still mocked, and `docs/marketing-audit.md` for how every claim in this file was checked.

## Problem

Whoever operates a treasury must be able to reduce risk quickly with one key, but must not be able to add risk without more approvals. Stellar's classic multisig can't express that: every operation falls into one weighted threshold, so the model can't tell entering a position apart from leaving it.

On Ethereum, [Zodiac Roles](https://github.com/gnosisguild/zodiac-modifier-roles) solves this on top of Safe by scoping permissions per contract, function, and argument. Stellar has no equivalent yet. Soroban smart accounts already expose everything needed to build one: the `__check_auth` function receives the full list of authorized calls, each with its contract, function name, and arguments — making function- and argument-level policies possible. [OpenZeppelin's Stellar smart-accounts framework](https://github.com/OpenZeppelin/stellar-contracts) provides threshold and weighted-threshold policies, but (per its RC v0.7.0 audit) scopes rules only by contract address, discarding function and arguments.

## Proposal

**Barad Roles** is a `RolesPolicy` compatible with OpenZeppelin's smart accounts, plus tooling to configure it safely:

- **Asymmetric thresholds** — exit rules need 1 signature, entry rules need M, with deny-by-default so a loose rule can never authorize an entry.
- **Function- and argument-level conditions** — equality, set membership, equality to the account's own address, and numeric ranges.
- **Protocol presets** — reviewed, ready configurations for 1–2 Stellar protocols, so a manager doesn't have to reinterpret each contract's functions from scratch. Not built yet — see Status.
- **External audit planned** — via the Soroban Audit Bank, if eligible, plus fuzzing, invariant tests, and mainnet-fork tests. None of that exists yet; today there are 14 unit and property tests.
- **Review tooling** — a CLI and SDK to define, validate, lint, and diff permissions, so approvers understand what they're signing. `simulate` and `apply` (to install a policy via a signed transaction) are not built yet.

### Architecture

The smart account is the treasury. Each action is covered by a context rule with its own signers and policy:

- **ADMIN** (default): N-of-M governance signers — the only rule that can change rules and policies.
- **EXIT**, per target protocol: 1 operator signature, scoped to exit-only functions.
- **ENTRY**, per target protocol: M approver signatures, scoped to listed entry functions (plus the token `transfer`/`approve` calls entry requires).

`roles-policy` denies anything not explicitly allowed. Operators can only reach the EXIT rule; entries and configuration changes require more signatures.

## Repository layout

```
contracts/roles-policy/   # Soroban policy contract (Rust) — implemented, tested, builds to wasm
crates/roles-config/      # shared config types (no_std)
sdk/                      # @barad/sdk — config schema, lint, diff (TypeScript, offline)
cli/                      # @barad/cli — `roles lint|diff|simulate|apply`
frontend/                 # Barad — the wallet UI (Next.js), see frontend/README.md
examples/                 # example *.toml roles configs for the CLI
docs/spec.md              # the original SCF proposal and specification
docs/landing-page-spec.md # the landing page design and messaging spec
docs/marketing-audit.md   # claim-by-claim audit against that spec
docs/validations.md       # dated findings for the spec's open questions
tests/                    # fork tests, invariants, fuzz targets (not yet added)
.github/workflows/        # CI (not yet added)
```

`sdk`, `cli`, and `frontend` are a single pnpm workspace — run `pnpm install` at the repo root.

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

## Status and what's next

Done so far:

- `contracts/roles-policy` implements OpenZeppelin's `Policy` trait against `stellar-accounts` 0.8.0, verified against that crate's real source (not just the spec's pseudocode). It passes 14 tests (11 unit + 3 property-based) and builds to a deployable wasm (`stellar contract build`).
- `@barad/sdk` and `@barad/cli` implement `roles lint` and `roles diff` for real, operating on local TOML config files — no network needed. `roles simulate` and `roles apply` are honest stubs: they explain exactly what infrastructure they need (a deployed contract, a funded testnet account, an RPC endpoint) rather than faking a result.
- `frontend` has two parts, per `Barad landing page design and messaging specification.md`: a landing page at `/` (hero, an interactive demo of the entry/exit asymmetry, a comparison of approaches, security/status, FAQ — every factual claim traced to `frontend/src/content/claims.ts` and checked in CI by `scripts/check-claims.ts`) and a prototype wallet UI at `/app` over illustrative data (`frontend/src/lib/mock-data.ts`) — treasury dashboard, ADMIN/EXIT/ENTRY rule cards, a policy viewer that renders conditions in plain language, always showing a "Demo data" banner. Freighter wallet connect works (read-only).

Still open, and gating the project per docs/spec.md ("Pending validations") — see `docs/validations.md` for dated findings as these get checked:

1. Do candidate users (asset managers, DAO treasuries, RWA issuers) want non-custodial, on-chain policy on Stellar, and would they accept it over an off-chain MPC custodian? Open — the plan is to find out via the SCF Open Track application itself.
2. ~~Does OpenZeppelin plan function- and argument-level conditions in its core?~~ **Checked 2026-11-02: no, not on their public roadmap through v1.0.0.** Third parties are filling the gap with per-transaction code generation instead of a reusable primitive. See `docs/validations.md`.
3. Does the [Mandate](https://github.com/SoroMandate/Mandate) project already cover enough of this?
4. Picking and verifying a real protocol preset (DeFindex/Templar/Soroswap are candidates in the examples, unverified) and deploying `roles-policy` to testnet.

**Submission deadline: 2026-11-09** (confirmed by the team) — 7 days out as of this writing. docs/spec.md's Week 1/Week 2 plan assumed a longer runway; it needs re-scoping against this date, not the December estimate it was written against.

See docs/spec.md for the full proposal: threat model, competitive landscape, milestones, and budget.

## License

Licensed under the [MIT License](LICENSE).

---

Barad is experimental open-source software, currently an early prototype that runs on demo data. It is not financial advice and has not been audited. Barad is an independent project built on Stellar and on OpenZeppelin's `stellar-accounts`; it is not endorsed by the Stellar Development Foundation or OpenZeppelin. Barad is a Sindarin word; this project is not affiliated with the Tolkien Estate.
