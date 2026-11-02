# Roles for Stellar: MVP proposal and specification

Oct 30, 2026 · @Luiz Gustavo

> **This is the original proposal (2026-10-30), describing a planned 24-week build.** Its "audited" language describes a funded future milestone (see Tranche #3 in "Milestones, schedule and budget"), not completed work. For current status, see `README.md` and `docs/validations.md`.

## Executive summary

We propose **Stellar Roles**: a set of audited policies for Soroban smart accounts (OpenZeppelin's framework) that scope permissions by contract, function and argument, and apply different signature thresholds for leaving a DeFi position and for entering one.

The guiding use case comes from asset management: exiting a position should require 1 signature, and entering one should require more. On Ethereum this is done with Zodiac Roles on top of Safe. On Stellar we found no equivalent that combines asymmetric thresholds, argument-level conditions, protocol presets and an audit.

Within 6 months (the SCF Build limit), the MVP delivers:

- a `RolesPolicy` compatible with OpenZeppelin's smart accounts;
- a CLI and SDK to define, validate, simulate, compare and install permissions;
- presets for 1 to 2 Stellar protocols;
- tests with a mainnet fork, fuzzing and invariants, and an external audit (Soroban Audit Bank, if eligible);
- deployment on testnet and mainnet, as open source.

**Status: hypothesis to validate.** Three answers decide whether we proceed: whether candidate users (asset managers, DAO treasuries, RWA issuers) want on-chain, non-custodial policy on Stellar; whether OpenZeppelin plans function- and argument-level conditions in its core; and whether the Mandate project already covers enough to make this redundant. See Pending validations. Suggested SCF track: Open.

## SCF track and funding path

The plan is to submit to the Open Track, framed as a financial primitive for treasuries, and to keep the RFP Track and the Public Goods Award as follow-up paths.

| Path | Fit | Condition |
| --- | --- | --- |
| Open Track | Primary. Panel review plus community vote. The handbook describes it for experienced teams building something new, and SCF 7.0 describes it for financial protocols and primitives ([SCF 7.0](https://stellar.org/blog/ecosystem/introducing-scf-v7)) | Frame the project as a treasury access-control primitive; show design partners, a prototype and verifiable team experience |
| RFP Track | Natural for developer tooling and infrastructure, but only for an open RFP; the Q4 2026 RFPs were not published at the time of writing ([RFP Track](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track)) | Watch for the Q4 briefs; post the idea for selection in the Q1 2027 RFPs |
| Integration Track | Not a fit: the handbook sends tools and libraries for developers to the RFP Track, and requires an application with traction plus an on-chain metric ([Integration Track](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track)) | Only if the module is productized as an application with users |
| Public Goods Award | For maintenance after the build; not an open application ([Official Rules](https://stellar.gitbook.io/scf-handbook/supporting-programs/public-goods-award/official-rules)) | After mainnet and community validation |

The SCF FAQ lists End-User Applications and Financial Protocols as the main categories and says some developer tooling is supported through RFPs and the Public Goods Award ([FAQ](https://stellar.gitbook.io/scf-handbook/additional-support/faq)). That makes the Open Track harder for pure infrastructure, so the submission must show the financial use case and real users. In SCF #41, 33 Open Track submissions were reviewed by 94 voters and 12 were awarded ([recap](https://medium.com/stellar-community/scf-41-round-recap-319b63ca1218)).

**Actions for the first week**

- [ ] Submit the SCF interest form selecting the Open Track; add a referral code, if there is one.
- [ ] Send the track-fit question to the SCF team (draft in the appendix).
- [ ] Post the idea on the Stellarlight Ideas page and in the #governance channel of the Stellar Dev Discord (draft in the appendix), to be considered for the Q1 2027 RFPs.
- [ ] Read the handbook's Open Track page, especially the section on what makes a strong submission, and update this document to match.
- [ ] Have the prototype and a public repository ready before submitting.

## Problem and opportunity

Whoever operates a treasury must be able to reduce risk quickly with one key, but must not be able to add risk without more approvals; Stellar's classic multisig cannot express that.

**Reference on Ethereum.** Zodiac Roles v2, developed by Gnosis Guild, lets a manager operate a treasury only within an approved policy. In the ENS DAO endowment, the policy includes token-in and token-out lists for swaps on CoW Swap, Uniswap v3 and Balancer ([Tally proposal](https://www.tally.xyz/gov/ens/proposal/107992041043258996427224563090014372885335179099580585497266204203463156791290)).

**Limit of Stellar's classic multisig.** Each operation falls into a category (low, medium or high) with a threshold from 0 to 255 and a weight per key. A payment is always a medium-threshold operation, so the model cannot tell entering a position from leaving it ([Stellar docs: multisig](https://developers.stellar.org/docs/glossary/multisig/)).

**What Soroban smart accounts allow.** An account contract's `__check_auth` function receives the list of authorized calls, each with its contract, function name and arguments ([soroban-sdk: auth.rs](https://docs.rs/soroban-sdk/latest/src/soroban_sdk/auth.rs.html)). That makes function- and argument-level policies possible.

**What OpenZeppelin's framework lacks.** According to the audit of version RC v0.7.0, `CallContract` rules scope only by contract address and discard the function and arguments; whoever holds a rule for a contract authorizes all of its protected functions ([audit](https://www.openzeppelin.com/news/stellar-contracts-rc-v0.7.0-audit)). That audit is about six months old, so the current state must be reconfirmed. The reference policies are simple threshold, weighted threshold and spending limit ([policy docs](https://docs.openzeppelin.com/stellar-contracts/accounts/policies)).

**Why the use case needs its own policy.** The account now selects rule IDs explicitly, and those IDs are bound into the signed digest ([PR #952](https://github.com/OpenZeppelin/stellar-contracts/pull/952)). That prevents swapping the rule after signatures are collected, but a 1-signature rule scoped to a contract could still be chosen for an entry call. The rule's own policy must reject everything that is not an exit.

**Opportunity.** Tokenized real-world assets on Stellar exceeded US$ 3 billion in Q2 2026 ([Bitget](https://www.bitget.com/news/detail/12560605673991), based on the SDF report), and issuers and managers need treasury controls compatible with that.

## Users and demand validation

Demand is still a hypothesis: no design partner is confirmed, so validation with real users is the project's first condition.

| User | Need | Evidence so far | Status |
| --- | --- | --- | --- |
| Asset managers | Exit with 1 signature, entry with more signatures | Equivalent model in use on Ethereum (Zodiac Roles) | No design partner confirmed |
| DAO treasuries | Roles scoped by protocol, token lists and limits | Zodiac Roles v2 on Ethereum | Hypothesis for Stellar |
| RWA and stablecoin issuers | Treasury controls and separation of duties | Tokenized RWA on Stellar above US$ 3 billion (Q2 2026) | Hypothesis, no contact yet |
| Teams operating payment agents | Spending limits and allowlists | Several agent projects on Stellar (see Competitive landscape) | Already partly served |

**What must be confirmed with candidate design partners:** whether they want to operate on Stellar, with which protocols, what the exact entry and exit policy is, how many signers they use, and whether they accept non-custodial on-chain policy instead of an MPC custodian. A support letter or a design-partner role would strengthen the proposal, since SCF asks for a need validated by people with experience in the ecosystem ([submission criteria](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/submission-criteria)).

**About the team's experience.** The team reports experience with CoW and 1inch (to be documented with verifiable links) and took part in Trustful, a reputation project funded by SCF (#27, US$ 50k, and #30, US$ 92k; [project page](https://communityfund.stellar.org/project/trustful-sce)). The SCF #41 recap reports that the lack of verifiable Soroban/Rust experience was repeatedly flagged by reviewers ([recap](https://medium.com/stellar-community/scf-41-round-recap-319b63ca1218)). The proposal therefore needs to name who signs off the Soroban code and show a testnet prototype.

## Competitive landscape

No project we found combines asymmetric thresholds between entry and exit, argument-level conditions, protocol presets and an audit; several cover parts, and OpenZeppelin could absorb the core. The search was not exhaustive and each project's maturity was not verified.

| Project | What it does | Coverage vs. Stellar Roles | Note |
| --- | --- | --- | --- |
| [OpenZeppelin stellar-contracts (accounts)](https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/accounts) | Smart accounts with context rules, signers and policies (simple threshold, weighted threshold, spending limit) | Foundation of the project; no function or argument scoping in the core (audit RC v0.7.0) | Risk of absorbing the feature |
| [Mandate](https://github.com/SoroMandate/Mandate) | Allowlist policy by contract and, optionally, by functions (up to 20 entries), time window, per-period cap | Function: yes. Arguments and asymmetric threshold: not found | Closest |
| [Policywright](https://github.com/kunaldrall29/policywright) | Generates the context rule and the minimal policies from a transaction; optional argument-level scope | Generator, not an audited policy engine | Complementary |
| [Stellar Agent Guard](https://github.com/opeolarewaju5-glitch/stellar-agent-guard-contracts), [stellar-x402-policies](https://github.com/JoseCToscano/stellar-x402-policies), [Solvane](https://github.com/CyberVerse2/solvane), [AgentCard](https://github.com/402md/agentcard) | Spending limits, allowlists, roles and emergency keys for agents | Focus on payment agents, not treasuries | May expand |
| [Crossmint stellar-smart-account](https://github.com/crossmint/stellar-smart-account) | Account with multisig, role-based control and policy-based authorization via plugins | Alternative account | Maturity not verified |
| [MultiClique](https://communityfund.stellar.org/submissions/recRZEosG6FWORKcP) (SCF #19, US$ 97.5k) | Custom account with a signer policy and thresholds for transfers and contract calls | Predecessor, built before OpenZeppelin's framework | Current state unknown |
| [Quorum Vault](https://github.com/laurastephaniee/quorum-vault), [Stellar Vault](https://stellarvault-olive.vercel.app/) | M-of-N treasury with proposals and approvals; confidential version with ZK | Treasury, no function-level scoping | Different use cases |
| MPC custody: Fireblocks, BitGo, Taurus, Dfns, Fystack, [MPCVault](https://communityfund.stellar.org/submissions/recqthdtpf2npbyzy) | Off-chain keys and policy engine, with Stellar support ([comparison](https://fystack.io/blog/stellar-custody-in-2026-ecosystem-risks-and-custody-providers-compared)) | Institutional alternative, not on-chain | Main commercial risk |
| Zodiac Roles v2 (Ethereum) | Reference for scoped permissions on top of Safe | Product reference | Not applicable to Stellar |

The most relevant competitor for an asset manager may not be another Stellar project but an MPC custodian with off-chain policy. On Ethereum, Zodiac Roles enforces policy on-chain without a custodian, which is why managers adopt it for DAO treasuries; if target users on Stellar accept the custodian model, the main audience disappears.

## Value proposition and differentiators

Stellar Roles gives a treasury what the current framework does not: permissions that state what each operator may do, and how many signatures each type of action needs.

- **Asymmetric thresholds.** Exit rules with 1 signature and entry rules with M signatures, with deny-by-default, so a loose rule can never authorize an entry.
- **Function- and argument-level conditions.** Equality, set membership, equality with the account's own address (for example, "the destination is the vault") and numeric ranges.
- **Protocol presets.** Ready, reviewed configurations for 1 to 2 Stellar protocols, so a manager does not need to reinterpret each contract's functions.
- **Institutional quality.** External audit (through the Soroban Audit Bank, if eligible), fuzzing, invariant tests and mainnet-fork tests.
- **Review tooling.** A CLI to validate, simulate and compare versions of a policy, so approvers understand what they are approving (the role the Zodiac Roles app plays on Ethereum).

**Relationship with existing projects.** The module is built on OpenZeppelin's framework, implements the same policy interface and works with Stellar's Smart Account Kit ([repository](https://github.com/stellar/smart-account-kit)). We intend to contribute upstream whatever makes sense for the core. Policy generators such as Policywright can emit configurations for our engine instead of competing with it.

**Monitoring integration.** Stellar has a monitoring partnership with Hypernative for ecosystem projects ([announcement](https://www.hypernative.io/insights/blog/stellar-activates-ecosystem-wide-protection-with-hypernative)). The module emits compact events so that those tools, or open-source ones such as [soroban-sentinel](https://github.com/ekwe7/soroban-sentinel), can alert on unusual use.

## Architecture and technical specification

Stellar Roles is a policy for the `Policy` trait of OpenZeppelin's smart accounts, plus a CLI and an SDK: the decision to authorize lives entirely in the contract, and the tools only prepare and verify configurations.

### Components

1. `roles-policy`: a Soroban contract in Rust that implements the policy trait, stores the configuration per account and rule, and denies by default.
2. `roles-presets`: reviewed configurations per protocol (functions, arguments and token sub-invocations). The MVP covers 1 to 2 protocols.
3. `roles-cli` and a TypeScript SDK: validation, simulation, comparison and generation of the installation transactions, compatible with the Smart Account Kit.
4. Test suite: unit, property, invariant and fork tests, plus CI.

### Rule model for entry and exit

The smart account is the treasury. Each action is covered by a context rule with its own signers and policies:

- **ADMIN (Default):** N of M governance signers. It is the only rule that changes rules and policies.
- **EXIT, per target protocol:** context `CallContract(protocol)`, operator signers, policies `simple_threshold(1)` and `RolesPolicy(Exit)`.
- **ENTRY, per target protocol:** context `CallContract(protocol)`, operators and approvers, policies `simple_threshold(M)` and `RolesPolicy(Entry)`.
- **Token helpers:** context `CallContract(token)` for the `transfer` and `approve` calls that entering requires. They exist only in the ENTRY rule.

**Design hypothesis, to verify per protocol:** entering a position requires the account to authorize a token transfer or approval (a sub-invocation), and exiting does not. If this holds, the EXIT rule can deny any outflow of funds from the account and still restrict the call to the protocol, which gives the asymmetry without relying only on the number of signatures.

&#91;embedded content: Stellar Roles architecture · 3 rules, 1 policy, 1 tool\]

Operators can only reach the EXIT rule; entries and configuration changes go through rules with more signatures, and the policy denies any call outside the list.

### Evaluation (`enforce`)

Each authorization context goes through the steps below; any failure aborts the transaction (panic), following OpenZeppelin's current policy model, in which `enforce` validates and updates state ([docs PR #139](https://github.com/OpenZeppelin/docs/pull/139/files)).

1. Read the context (contract, function and arguments) and the chosen rule, whose ID is already bound into the signed digest.
2. Deny contract-creation contexts outside the ADMIN rule.
3. Find the contract in the target list; if it is not there, deny.
4. Find the target's function; if it is not there, deny.
5. Evaluate all of the function's conditions on the arguments; any false condition denies.
6. Emit a compact event with the rule, the contract and the function, without arguments.

### Configuration and interface (pseudocode)

```rust
// Pseudocode: confirm names and signatures against the stellar-accounts version in use.
pub enum Mode { Exit, Entry }

pub enum Cond {
    Eq(u32, Val),            // argument i equals the value
    OneOf(u32, Vec<Val>),    // argument i belongs to the set
    EqSelf(u32),             // argument i equals the account's address
    Range(u32, i128, i128),  // argument i (i128) within the range
}

pub struct FnRule { pub name: Symbol, pub conds: Vec<Cond> }
pub struct Target { pub contract: Address, pub fns: Vec<FnRule> }
pub struct RolesConfig { pub mode: Mode, pub targets: Vec<Target> }

// Policy interface (OpenZeppelin's Policy trait)
fn install(e: &Env, cfg: RolesConfig, rule: ContextRule, account: Address);
fn enforce(e: &Env, ctx: Context, signers: Vec<Signer>, rule: ContextRule, account: Address); // panic = denied
fn uninstall(e: &Env, rule: ContextRule, account: Address);
fn get_config(e: &Env, account: Address, rule_id: u32) -> RolesConfig;
```

### Storage, limits and costs

- The configuration lives in persistent storage keyed by (account, rule ID), because the same policy serves several accounts and rules ([policy docs](https://docs.openzeppelin.com/stellar-contracts/accounts/policies)).
- The TTL is extended on every `enforce` and by an administrative function, to avoid expiry.
- Initial limits, to be calibrated by benchmarking CPU and reads: up to 8 targets per rule, 8 functions per target and 4 conditions per function.
- Framework limits: 15 rules per account, 15 signers per rule and 5 policies per rule ([context rules docs](https://docs.openzeppelin.com/stellar-contracts/accounts/context-rules)).
- Events omit the arguments, because events carrying the full context can exceed the transaction size limit ([issue #852](https://github.com/OpenZeppelin/stellar-contracts/issues/852), [PR #896](https://github.com/OpenZeppelin/stellar-contracts/pull/896)).

### Tooling (CLI and SDK)

- `roles lint`: flags a loose Default rule, a threshold above the number of signers, a 1-signature rule without a function restriction, and an EXIT rule that lets funds leave. Inspired by [rulelens](https://github.com/bilhokista/rulelens), which checks smart-account configurations.
- `roles simulate`: runs a transaction against the configuration using a network fork ([soroban-fork](https://docs.rs/soroban-fork)).
- `roles diff`: compares two configurations and highlights any widening of permissions.
- `roles apply`: generates the rule-creation and policy-installation transactions, for wallets to sign through the Smart Account Kit.

Illustrative configuration example (real function names depend on each protocol):

```toml
[account]
address = "C...ACCOUNT"

[[rule]]
name = "exit-protocol-x"
mode = "exit"
threshold = 1
signers = ["G...OPERATOR1", "G...OPERATOR2"]

  [[rule.target]]
  contract = "C...PROTOCOL"

    [[rule.target.fn]]
    name = "<exit_function>"
    conds = [{ arg = 2, op = "eq_self" }]
```

### Compatibility and versions

The project pins the versions of `stellar-accounts` and `soroban-sdk`, and CI runs against OpenZeppelin's main branch and against the testnet of the next protocol. The framework is still changing: there were breaking changes, such as the new `CreateContractExternalRef` context type in Protocol 28 ([docs PR #246](https://github.com/OpenZeppelin/docs/pull/246)), and Protocol 30 is up for a vote in November 2026 ([guide](https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide)).

## Threat model and security

The design principle is to fail closed: anything the configuration does not explicitly allow is denied, and a compromised operator key should be able to do no more than reduce risk.

| Threat | Mitigation |
| --- | --- |
| Compromised key of an EXIT-rule operator | The rule accepts only exit functions with argument conditions (for example, destination equal to the account) and denies any outflow of funds from the account; alerts through events |
| A malicious operator forces exits and causes opportunity cost | Per-call range conditions in the MVP; per-period cap and delay in phase 2; monitoring |
| Using the 1-signature rule on an entry call | Deny-by-default in the rule's policy; rule IDs bound into the signed digest ([PR #952](https://github.com/OpenZeppelin/stellar-contracts/pull/952)) |
| A loose Default rule that bypasses the others | `roles lint` and tests; rulelens's configuration tests already show that a 1-signer Default rule bypasses a spending limit |
| Unauthorized change of the configuration | Only the ADMIN rule can change it; change events; delay for changes in phase 2 |
| Target protocol changes behavior after an upgrade | Scope pinned to the contract address; monitoring; pinning the target's Wasm hash in phase 2, if feasible (to verify) |
| Unexpected context (contract creation, sub-invocation) | Creation contexts denied outside the ADMIN rule; sub-invocations must match the target list |
| CPU or read budget overrun from large configurations | Hard limits on targets, functions and conditions, and a benchmark before fixing the values |
| Reentrancy | The platform does not allow reentrancy, which reduces this class of attack ([Stellar](https://stellar.org/blog/developers/soroban-the-smart-contract-platform-designed-for-developers)) |
| Large events that make the transaction fail | Events without arguments ([issue #852](https://github.com/OpenZeppelin/stellar-contracts/issues/852)) |

**Planned tests.**

- Unit and property tests, including fuzzing with cargo-fuzz ([official guide](https://developers.stellar.org/docs/build/guides/testing/fuzzing)).
- Invariant tests (for example, "no call outside the list is authorized"), with our own framework or [Breakwater](https://github.com/Belvast-Innovation/Breakwater), which is still at an early stage.
- Tests with a mainnet and testnet fork ([official guide](https://developers.stellar.org/docs/build/guides/testing/fork-testing) and [soroban-fork](https://docs.rs/soroban-fork)).
- Upgrade checks of the module itself with tools such as [soroban-upgrades](https://github.com/bielcarpi/soroban-upgrades).

**Audit.** The [Soroban Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank) offers an initial audit to SCF-funded projects involving financial protocols, with a refundable 5% co-payment if critical, high and medium findings are fixed within 20 business days, normally after the testnet tranche. This project's eligibility must be confirmed with the SCF team.

## MVP scope

The MVP proves the core case, exit with 1 signature and entry with more, on a real protocol, with an auditable policy and minimal tooling to configure it.

**In the MVP**

- `RolesPolicy` with Exit and Entry modes, deny-by-default and the Eq, OneOf, EqSelf and Range conditions.
- Compact events for enforcement and for configuration changes.
- A CLI with `lint`, `simulate`, `diff` and `apply`, and a TypeScript SDK integrated with the Smart Account Kit.
- 1 to 2 presets for Stellar protocols with distinct entry and exit functions (to be chosen and verified).
- Unit, property, invariant and fork tests, with CI.
- A testnet demonstration with a real protocol, and mainnet deployment of the policy contract after the audit.
- Documentation, examples and an operations guide for managers and DAOs, as open source.

**Out of the MVP (phase 2)**

- A web interface to review and compare policies.
- Delays (timelock) for entries and for policy changes.
- Custom per-period caps beyond OpenZeppelin's spending limit.
- Decoding of structured and nested arguments, such as a lending protocol's request list (to be verified on Blend).
- Pinning the Wasm hash of target protocols.
- Integrated monitoring and account hierarchies.

## Prototype plan (repository kickoff)

The prototype proves one claim on testnet: the same account approves an exit with 1 signature and denies an entry with 1 signature. Everything else supports that demonstration.

### Suggested repository layout

```text
stellar-roles/
  contracts/roles-policy/   # Soroban policy contract (Rust)
  crates/roles-config/      # shared config types (no_std)
  cli/                      # roles lint, simulate, diff, apply
  sdk/                      # TypeScript, wraps the Smart Account Kit
  tests/                    # fork tests, invariants, fuzz targets
  examples/                 # demo accounts and presets
  docs/                     # design, threat model, operations guide
  .github/workflows/        # CI: build, test, fuzz smoke, lint
```

### Setup and versions (verify on day 1)

- Pin `soroban-sdk` and OpenZeppelin's `stellar-accounts` to versions that build together. Third-party projects cite `stellar-accounts` 0.8.x with `soroban-sdk` 28.x, and Protocol 30 is up for a vote in November 2026, so recheck before fixing versions.
- Use the Stellar CLI, a funded testnet account and the [Smart Account Kit](https://github.com/stellar/smart-account-kit) to deploy the account and install rules.
- Check the licenses of all dependencies before choosing the repository license (permissive; SCF asks for a licensing scheme and a commitment to build in the open).
- Turn on CI from the first commit.

### Week 1

1. Create the public repository with a README that states the problem, a license and CI.
2. Deploy a baseline smart account on testnet with three rules (ADMIN, EXIT, ENTRY) using only OpenZeppelin's threshold policies. Write a test that shows the gap: the 1-signature rule scoped to a contract also authorizes an entry call. This is the motivating evidence.
3. Choose the demo protocol among those on the [SCF Integration List](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track/integration-list) with distinct entry and exit functions (DeFindex, Templar and Soroswap are candidates, to be verified). Record the exact functions, arguments and token sub-invocations for entry and for exit from a real testnet transaction and a simulation.
4. Implement `RolesPolicy` v0 with deny-by-default and the Eq and EqSelf conditions, with unit tests for every deny path.

### Week 2

5. Add OneOf and Range, compact events and TTL extension, and fuzz the evaluator ([official guide](https://developers.stellar.org/docs/build/guides/testing/fuzzing)).
6. Add a fork test with [soroban-fork](https://docs.rs/soroban-fork) that replays the demo flow against real protocol state.
7. Write the demo script: exit with 1 signature (approved), entry with 1 signature (denied), entry with M signatures (approved), and a configuration change with N of M (approved).
8. Draft `roles lint` and `roles diff` on a small config file, write the threat model and measure CPU and reads per enforced call.
9. Record the demo, write the design document and post the idea (see the appendix).

### Definition of done for the prototype

- Public repository with CI passing and a permissive license.
- Contracts and accounts on testnet, with verifiable transactions for the four demo cases.
- Benchmark of CPU and reads per enforced call, and the limits that follow from it.
- A short written threat model and a list of known gaps.
- A short demo video and the design document, linked from the submission.

### Who reviews the Soroban code

Name a person with proven Soroban experience as reviewer or co-maintainer before submitting: the SCF #41 recap reports that the lack of verifiable Soroban/Rust experience was flagged repeatedly ([recap](https://medium.com/stellar-community/scf-41-round-recap-319b63ca1218)). AI-assisted coding is fine, but this contract controls funds, so a human who can answer for it must understand, test and review the code.

## Milestones, schedule and budget

The plan fits in 24 weeks and follows the SCF Build tranche structure: an initial payment of 10% at approval, then MVP, testnet and mainnet deliveries, with a cap of US$ 150k in XLM and a maximum duration of 6 months ([budget and deliverables](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/budget-and-deliverable-guidelines), [FAQ](https://stellar.gitbook.io/scf-handbook/additional-support/faq)). The timings below count from approval.

&#91;embedded content: Proposed schedule · 5 phases, 3 tranches, 24 weeks\]

Each tranche releases payment at the end of a phase. The audit starts only after the testnet tranche, which is why mainnet comes last.

### Milestones and how to verify them

| Tranche | Deliverables | How to verify |
| --- | --- | --- |
| #0 (10%, at approval) | Final specification, open repository with a permissive license, results of the validations (design partners, OpenZeppelin, Mandate) | Public repository and validation report published |
| #1 MVP | `RolesPolicy` v0 with Exit and Entry, unit and fuzz tests, CLI with `lint` and `diff`, 1 preset | Tests passing in CI; recorded testnet demo: exit with 1 signature approved, entry with 1 signature denied |
| #2 Testnet | CLI `simulate` and `apply`, SDK, 2nd preset, invariant and fork tests, documentation, pilot with a partner on testnet, audit request | Contracts on testnet with verifiable transactions; invariant suite in CI; request registered with the Audit Bank |
| #3 Mainnet | Audit completed and fixes applied, mainnet deployment, operations guide, mainnet pilot, final report | Audit report published; Wasm hash and mainnet address; at least 1 account with a policy installed on mainnet |

### Budget

The shares are a starting point; dollar amounts will be set by the team based on real costs, and SCF covers only the development costs of the Stellar-integrated components ([submission criteria](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/submission-criteria)).

| Workstream | Share of budget | Note |
| --- | --- | --- |
| Contracts (`RolesPolicy`, presets) and unit tests | 35% | Includes review by someone with proven Soroban experience |
| CLI, SDK and Smart Account Kit integration | 20% |  |
| Advanced testing (fork, fuzzing, invariants) and CI | 10% |  |
| External Soroban review and audit-finding fixes | 15% | Audit Bank co-payment, if eligible |
| Documentation, examples and reports | 10% |  |
| Management, partner validation and open communication | 10% |  |

### Success metrics (values to be set by the team)

- Number of accounts with policies installed on mainnet.
- Number of protocols with reviewed presets.
- Test coverage and open critical audit findings (target: zero).
- Number of pilot teams and support letters obtained.
- Contributions accepted upstream at OpenZeppelin.

## Risks and mitigations

The two biggest risks are commercial and strategic, not technical: the anchor users may not operate on Stellar, and OpenZeppelin may absorb the core of the feature.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Target users (asset managers, DAO treasuries) do not plan to operate on Stellar | High | Validate before submitting; keep DAOs and RWA issuers as alternatives; proceed only with at least one confirmed design partner |
| OpenZeppelin adds function- and argument-level conditions to the core | High | Talk to the team beforehand; contribute upstream; keep the value in presets, tooling and audit on top of the core |
| Mandate or Policywright already cover enough | Medium | Read the code and map the gaps; integrate instead of competing if that is the case |
| Team without proven Soroban experience | High | Name a Soroban lead (partner or contractor), show a testnet prototype before submitting, external review ([SCF #41 recap](https://medium.com/stellar-community/scf-41-round-recap-319b63ca1218)) |
| Security flaw in the policy contract | High | Deny-by-default, fuzzing, invariants, audit, hard limits, gradual rollout |
| OpenZeppelin's framework changes and breaks compatibility | Medium | Pin versions, run CI against the main branch, follow issues and audits |
| Framework limits (15 rules, 15 signers, 5 policies) restrict large treasuries | Medium | Design with few rules per account; evaluate delegated signers that are contracts (to verify) |
| Institutions prefer MPC custody with off-chain policy | Medium | Position as a non-custodial, auditable alternative; validate with users |
| Stellar protocol changes (fast cadence) | Medium | CI against the next protocol's testnet; follow the upgrade guides |

## Pending validations and open questions

These checks must be done before submitting; the results of the first three decide whether the project goes ahead.

**With candidate design partners (asset managers, DAO treasuries, RWA issuers)**

- [ ] Do they plan to operate on Stellar? With which protocols and assets?
- [ ] What is the exact policy: what counts as entry and exit, how many signers, and what per-call limits?
- [ ] Do they accept non-custodial on-chain policy, or do they prefer an MPC custodian with off-chain policy?
- [ ] Would they act as a design partner and provide a support letter?
- [ ] What stops a single compromised signer from causing damage even with 1 signature (for example, forced exits)?

**With OpenZeppelin**

- [ ] Are function- and argument-level conditions planned for the core? Is there an issue or roadmap (for example, items #514, #850 and #858, cited as trackers for smart accounts, a policy generator and a frequency limit)?
- [ ] Would they accept upstream contributions of a policy like this?
- [ ] Are the policy rejection behavior and the binding of rule IDs to the signed digest stable in the current version of `stellar-accounts`?

**Technical review**

- [ ] Read the code of Mandate and Policywright and map what they cover and what is missing.
- [ ] Confirm, per target protocol, which functions and arguments separate entry from exit, and whether the token sub-invocation hypothesis holds (including how Blend models requests).
- [ ] Check the state of MultiClique: finished, audited, in use?
- [ ] Check whether the SCF policy-generator RFP is open and how the project relates to it.
- [ ] Check whether signers that are contracts (delegation) work around the framework limits.

**SCF process**

- [ ] Submit the interest form and get the invitation; include a referral code, if any ([process](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award)).
- [ ] Read the Official Rules on other funding and duplication, and confirm eligibility for the Audit Bank.
- [ ] Dates: SCF #46 closes full submissions on November 8, 2026 ([source](https://github.com/TheAliphant/proofrail/issues/2)); #47 should close around mid to late December (an estimate from the 6-week cycle, to be confirmed on the website).
- [ ] Define the team's Soroban lead and prepare the testnet prototype.

## References

Links to pages consulted during the research (October 30, 2026). The maturity of third-party projects was not verified, and the search was not exhaustive.

**SCF and Stellar programs**

- [SCF Handbook](https://stellar.gitbook.io/scf-handbook)
- [Build Award: process](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award)
- [Submission criteria](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/submission-criteria)
- [Budget and deliverables](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/budget-and-deliverable-guidelines)
- [RFP Track](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track)
- [Integration Track](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track)
- [SCF FAQ](https://stellar.gitbook.io/scf-handbook/additional-support/faq)
- [SCF #41 recap](https://medium.com/stellar-community/scf-41-round-recap-319b63ca1218)
- [Soroban Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank)
- [SCF #46 deadline (cited by a project)](https://github.com/TheAliphant/proofrail/issues/2)
- [Trustful on SCF](https://communityfund.stellar.org/project/trustful-sce)

**Stellar and Soroban documentation**

- [Multisig](https://developers.stellar.org/docs/glossary/multisig/) and [signatures](https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig)
- [Complex Account (official example)](https://developers.stellar.org/docs/build/smart-contracts/example-contracts/complex-account)
- [soroban-sdk: auth.rs](https://docs.rs/soroban-sdk/latest/src/soroban_sdk/auth.rs.html)
- [Signing Soroban invocations](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations)
- [Fork testing](https://developers.stellar.org/docs/build/guides/testing/fork-testing) and [fuzzing](https://developers.stellar.org/docs/build/guides/testing/fuzzing)
- [Bell upgrade guide (Protocol 30)](https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide)

**OpenZeppelin (technical base)**

- [stellar-contracts: accounts](https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/accounts)
- Docs: [context rules](https://docs.openzeppelin.com/stellar-contracts/accounts/context-rules) and [policies](https://docs.openzeppelin.com/stellar-contracts/accounts/policies)
- [Docs PR #139: explicit rule selection](https://github.com/OpenZeppelin/docs/pull/139/files) and [PR #246](https://github.com/OpenZeppelin/docs/pull/246)
- [RC v0.7.0 audit](https://www.openzeppelin.com/news/stellar-contracts-rc-v0.7.0-audit)
- [PR #952: binding of rule IDs](https://github.com/OpenZeppelin/stellar-contracts/pull/952)
- [Issue #852](https://github.com/OpenZeppelin/stellar-contracts/issues/852) and [PR #896](https://github.com/OpenZeppelin/stellar-contracts/pull/896): event size
- [Smart Account Kit](https://github.com/stellar/smart-account-kit)
- [rulelens](https://github.com/bilhokista/rulelens)

**Related projects on Stellar**

- [Mandate](https://github.com/SoroMandate/Mandate) and [Policywright](https://github.com/kunaldrall29/policywright)
- [stellar-x402-policies](https://github.com/JoseCToscano/stellar-x402-policies), [Stellar Agent Guard](https://github.com/opeolarewaju5-glitch/stellar-agent-guard-contracts), [Solvane](https://github.com/CyberVerse2/solvane), [AgentCard](https://github.com/402md/agentcard)
- [Crossmint stellar-smart-account](https://github.com/crossmint/stellar-smart-account)
- [MultiClique on SCF](https://communityfund.stellar.org/submissions/recRZEosG6FWORKcP)
- [Quorum Vault](https://github.com/laurastephaniee/quorum-vault) and [Stellar Vault](https://stellarvault-olive.vercel.app/)
- [Stellar Stratum](https://github.com/yripper/stellar-stratum) and [LOBSTR Vault](https://vault.lobstr.co/)
- [SCF submission on policy generation (Gateway.fm)](https://communityfund.stellar.org/submissions/recTFz7yIm9fWFHSx)

**Custody and monitoring**

- [Stellar custody in 2026 (Fystack)](https://fystack.io/blog/stellar-custody-in-2026-ecosystem-risks-and-custody-providers-compared)
- [MPCVault on SCF](https://communityfund.stellar.org/submissions/recqthdtpf2npbyzy)
- [Stellar and Hypernative](https://www.hypernative.io/insights/blog/stellar-activates-ecosystem-wide-protection-with-hypernative)
- [soroban-sentinel](https://github.com/ekwe7/soroban-sentinel)

**Testing tools**

- [soroban-fork](https://docs.rs/soroban-fork)
- [Breakwater](https://github.com/Belvast-Innovation/Breakwater)
- [soroban-upgrades](https://github.com/bielcarpi/soroban-upgrades)

**Ethereum reference and market context**

- [ENS DAO: Zodiac Roles v2 proposal](https://www.tally.xyz/gov/ens/proposal/107992041043258996427224563090014372885335179099580585497266204203463156791290)
- [Stellar: reentrancy on Soroban](https://stellar.org/blog/developers/soroban-the-smart-contract-platform-designed-for-developers)
- [Stellar Q2 2026: RWA above US$ 3 billion](https://www.bitget.com/news/detail/12560605673991)

## Appendix: outreach drafts

Two drafts to send this week. Replace the items in brackets before sending.

### Message to the SCF team (track-fit question)

**To:** communityfund@stellar.org

**Subject:** Track fit question: open-source smart-account permissions policy (Stellar Roles)

Hello SCF team,

We are preparing a submission for SCF #47 and would like to confirm the right track before we apply.

**Project.** Stellar Roles is an open-source (permissive license) set of audited policies for OpenZeppelin smart accounts on Soroban. It adds function- and argument-level conditions and asymmetric signature thresholds, for example 1 signature to exit a DeFi position and M signatures to enter one. It includes a CLI and an SDK to validate, simulate and compare configurations. It is intended as public-good infrastructure for asset managers, DAO treasuries and RWA issuers.

**Our understanding of the tracks.** The RFP Track requires an open RFP, and the Q4 RFPs are not yet published. The Integration Track sends tools for developers to the RFP Track. We therefore plan to apply to the Open Track, framed as a financial primitive for treasuries.

**Questions**

1. Is this appropriate for the Open Track, or would you recommend waiting for a Q1 RFP?
2. Are there additional criteria for infrastructure or public-good projects in the Open Track (maintenance, decentralization, infrastructure) that we should address?
3. Would the Soroban Audit Bank be available for this project if it is funded?

We submitted the interest form on \[date\] \[referral code: none / CODE\]. A testnet prototype and a public repository will be available at \[link\] by \[date\].

Thank you, \[Name\], \[team\], \[contact\]

### Idea for the Stellarlight Ideas page and the #governance channel

**Title:** Function- and argument-level permissions with asymmetric thresholds for Soroban smart accounts

**Problem.** A treasury needs its operator to be able to reduce risk with one key (exit a position) while more approvals are required to add risk (enter a position, approve tokens, change settings). Stellar's classic multisig thresholds work per operation category, and the context rules in OpenZeppelin's smart accounts scope by contract address, not by function or argument (RC v0.7.0 audit), so a 1-signature rule for a protocol also authorizes entries.

**What exists.** OpenZeppelin's threshold and spending-limit policies, Mandate (contract and function allowlists) and Policywright (policy generation). We found no audited policy engine that combines asymmetric thresholds, argument conditions and protocol presets.

**Proposed scope (RFP candidate).** An open-source policy contract for OpenZeppelin's `Policy` trait with deny-by-default evaluation; Eq, OneOf, EqSelf and Range conditions on arguments; a CLI and SDK to lint, simulate, diff and apply configurations; presets for 1 to 2 protocols from the SCF Integration List; fork, fuzz and invariant tests; an external audit; mainnet deployment; and a maintenance plan.

**Who benefits.** Asset managers, DAO treasuries, RWA issuers and anyone running Soroban smart accounts with delegated operators.

**Status.** We are building a testnet prototype in the open at \[repository link\]. Feedback from delegates and from anyone with this need is welcome.
