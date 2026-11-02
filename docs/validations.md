# Pending validations — findings

Tracks answers to the open questions in `docs/spec.md` ("Pending validations and open questions") as they get resolved. Each entry dates the check, since roadmaps and upstream repos move.

## OpenZeppelin: are function- and argument-level conditions planned for the core?

**Checked 2026-11-02. Answer: no — not on their public roadmap.**

- `stellar-accounts` 0.8.0 (current, released 2026-10-20) ships exactly three reference policies — `simple_threshold`, `weighted_threshold`, `spending_limit` — none of which scope by function name or argument. `spending_limit::enforce` only recognizes a hardcoded `transfer` call shape; everything else falls through to `NotAllowed`. The [accounts package docs](https://docs.openzeppelin.com/stellar-contracts/accounts/policies) confirm the same: `CallContract(Address)` is the only scoping mechanism described, and the page has no forward-looking statement about function- or argument-level conditions.
- Checked their open feature-tracking issues directly: [#514](https://github.com/OpenZeppelin/stellar-contracts/issues/514) (general smart-account enhancements tracker) and [#858](https://github.com/OpenZeppelin/stellar-contracts/issues/858) (a proposed `frequency_limit` policy, rate- not scope-related) — neither mentions function/argument scoping.
- Their public roadmap through **v1.0.0** (milestones due 2026-11-25 and 2026-12-30) is: ZK Email, a social-recovery policy, vesting wallets, RWA confidential support, NFT token-ID-length support, doc/wizard updates, and audit fixes. No scoped-policy item.
- The closest related activity is third-party, not core: [issue #850](https://github.com/OpenZeppelin/stellar-contracts/issues/850) is [oz-policy-builder](https://github.com/gateway-fm/oz-policy-builder) (Gateway.fm, SCF RFP-track funded) asking OpenZeppelin to reserve an error-code range for third-party policies. Their own description: *"We generate custom Rust only for the function and argument scoping your primitives don't cover."* That's a per-transaction code generator producing a bespoke contract per policy, not a configurable, reusable scoping primitive — and it confirms, from a team shipping on top of `stellar-accounts` today, that the core still doesn't cover this.

**Read for us:** the redundancy risk from OpenZeppelin absorbing this feature is low right now. Re-check before the audit phase (their roadmap moves roughly monthly) and if we talk to them directly, per the spec's own open question, ask explicitly rather than relying on this snapshot.

## SCF submission timeline

**Confirmed by the team 2026-11-02: the submission deadline is 2026-11-09** — one week out. `docs/spec.md` separately cites (secondhand, unverified) SCF #46 closing 2026-11-08 and estimates #47 for "mid to late December"; neither matches 2026-11-09 exactly, so confirm which round this deadline belongs to directly with the SCF team rather than assuming it's #46 or #47. Either way, the Week 1/Week 2 plan in `docs/spec.md` was scoped for a much longer runway and needs re-scoping against a ~1-week deadline before submitting.
