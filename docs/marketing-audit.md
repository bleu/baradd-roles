# Marketing audit

Required by `docs/landing-page-spec.md`, section 1, step 1. Checked 2026-11-03 against the repository as it stood at commit `dcb4bcc`. Each row: the claim as found, its status per the spec's claims matrix (section 4), and the fix applied (or still open).

| # | Where found | Claim as written | Status (spec §4) | Fix |
| --- | --- | --- | --- | --- |
| 1 | GitHub repo description | "Stellar Roles: **audited** Soroban smart-account permission policies..." | False (claim #5) | Replaced with the spec's suggested text: "Barad: an early-prototype treasury wallet for Soroban smart accounts. 1 signature to exit a DeFi position, more to enter. Open source (MIT)." No "audited," no "Stellar Roles." |
| 2 | `README.md` tagline | "built on **Stellar Roles**: **audited** permission policies..." | False (claim #5) + brand risk (§2, §11) | Rewrote: "Barad Roles" in place of "Stellar Roles"; "implemented and tested (14 tests), not yet audited." |
| 3 | `README.md` | "*Barad* — fortress, in Sindarin." | Inaccurate gloss (§2 problem 3) | Changed to "tower, also glossed fort/fortress ([Eldamo](https://elfdict.com/w/barad/s))." |
| 4 | `frontend/src/app/page.tsx` hero subhead | "built on **Stellar Roles**: **audited** policies..." | False (claim #5) + brand risk | Rewritten as part of the full hero rebuild (§6); "Barad Roles," no "audited." |
| 5 | Throughout README, frontend, repo description | Product name "Stellar Roles" for the policy engine | Brand-policy risk, not a factual-accuracy issue (§11: Stellar's brand policy restricts its marks in a trade name) | Renamed to "Barad Roles" in all forward-facing copy (README, landing page, this audit). Package/crate names (`roles-policy`, `roles-config`, `@baradd/sdk`, `@baradd/cli`, the `roles` CLI binary) never used "stellar" in the name and are unaffected. |
| 6 | `docs/spec.md` (multiple lines, e.g. line 7, 474, 494) | "Stellar Roles is... a set of **audited** policies" and similar | Not a live claim — see note below | Added a dated disclaimer banner at the top of the file instead of rewriting it; see reasoning below. |
| 7 | Repo name `barad-stellar-wallet` | N/A | Spec §11: "the team's call; check it" | Not changed. Flagging it to the team rather than renaming unilaterally — a repo rename breaks the existing GitHub URL, clone links, and anything pointing at it. |

## Note on `docs/spec.md`

`docs/spec.md` is the original SCF grant proposal (dated 2026-10-30, written before any code existed). Read in context, its "audited" language describes the *planned* end state of a funded 24-week build — Tranche #3 of its own budget table is literally "audit completed and fixes applied" — not a claim that an audit has already happened. Rewriting the proposal's own wording to match today's reality would falsify the historical record of what was proposed and when.

Instead of editing its prose, I added one line at the top:

> **This is the original proposal (2026-10-30), describing a planned 24-week build. For current status, see `README.md` and `docs/validations.md`.**

This keeps the historical document honest about being historical, without implying its "audited" language is a live claim. This document (`docs/marketing-audit.md`) and the live site are the places where "audited" must never appear unqualified, per the spec's acceptance checklist (§13).

## Words from the spec's avoid list (§10) found in current copy

Searched README, repo description, and frontend copy for: revolutionary, seamless, next-generation, cutting-edge, military-grade, bank-grade, unhackable, robust, powerful, empower, unlock, supercharge, Web3, trustless, "secure" without a mechanism, backed by, trusted by, partner, official.

None found outside this specification document itself (which uses several as *examples of what to avoid*, not as copy). The existing copy from the previous session was already fairly plain; the main defects were "audited" and the "Stellar Roles" naming above, not adjective-stuffing.

## Status of this audit against the spec's acceptance checklist (§13, "Facts" items)

- [x] "audited"/"audit-ready" removed from the repo description, README, and page metadata it controls.
- [x] "Stellar Roles" replaced with "Barad Roles" in forward-facing copy.
- [ ] Every factual sentence on the *new* landing page mapped to a `claims.ts` id — tracked as part of the page rebuild (§6–9), not this audit; see the session's final report for what's built versus still open.
