# Barad: landing page design and messaging specification

Nov 2, 2026 · @Luiz Gustavo

## 1. How to use this document

This is the brief for rebuilding the Barad landing page and its messaging. Read all of it before you change a file.

**Your job, in order**

1. Audit the current page, the README and the repository description against section 4 (claims) and section 10 (copy). Write the findings to `docs/marketing-audit.md`: each claim, its status, and the fix.
2. Fix the factual problems first. The repository description currently says "audited", and the project has not been audited.
3. Rewrite the messaging and rebuild the landing page as specified in sections 6 to 9.
4. Run the acceptance checklist in section 13 and report each item as pass or fail.

**Ground rules**

- Truth over polish. Every factual claim must map to a row in the claims matrix (section 4). If a claim is not there, do not make it; ask instead.
- The prototype status is visible on the page. Numbers shown in the wallet UI are demo data and must be labeled as such.
- Be specific. Show a scenario, a rule, a number. Remove adjectives that carry no information.
- Never name a partner, customer, investor or person who has not approved it in writing, and never add logos the team does not own.
- Do not change the semantics of the policy contract or the CLI. Marketing code lives in its own route group.
- If this document conflicts with what the repository actually does, the repository wins; flag the conflict.
- Ask before renaming a product, adding analytics, or collecting email addresses.

**Priorities**

| Priority | Scope |
| --- | --- |
| P0 | Fix false or unsupported claims; honest status block; the hero |
| P1 | Interactive demo; how it works; plain-language policy viewer |
| P2 | Comparison of approaches; FAQ; roadmap |
| P3 | Motion, Open Graph image, Portuguese translation |

## 2. Current state and what is real

Barad is an early prototype, and the page must say so. This section is read from the repository README on 2026-11-02; re-check the repository before relying on it, and note that the frontend source was not read when this brief was written.

**What Barad is.** A treasury wallet for Soroban smart accounts, built on a policy engine currently called Stellar Roles. The wallet is the product people see; the policy engine is what makes its rules enforceable on-chain.

| Component | State today | What the page may say |
| --- | --- | --- |
| `contracts/roles-policy` | Implemented against OpenZeppelin's `stellar-accounts` 0.8.0; 14 tests (11 unit, 3 property-based); builds to Wasm | "Implemented and tested." Not "audited". Not "deployed" (testnet deployment is still open) |
| `@baradd/sdk` and `@baradd/cli`: `lint`, `diff` | Real, offline, work on local TOML files | "Lint and diff a policy before you sign it" |
| `@baradd/cli`: `simulate`, `apply` | Honest stubs that explain what infrastructure they need | Do not present as working |
| `frontend` | Next.js UI over illustrative data in `mock-data.ts`: treasury dashboard, ADMIN/EXIT/ENTRY rule cards, plain-language policy viewer; Freighter connect is read-only | Label every figure "demo data". Do not imply a live treasury |
| Fork, fuzz and invariant tests; CI | Not added yet | Do not claim them |
| External audit | None. Soroban Audit Bank eligibility is unconfirmed | "Audit planned" only |
| Protocol presets | None verified; candidates are unverified | "On the roadmap" only |
| Testnet and mainnet deployments | None | Do not show addresses, TVL or transactions |
| Users, design partners, traction | None confirmed | Do not imply any |
| License | MIT | May be stated |

**Problems found in the repository itself**

- The repository description and the README tagline say "audited". That is false today and must be corrected first.
- The product is described as "Stellar Roles". Stellar's brand policy restricts using its marks in a product or domain name (see section 11), so the engine needs a different name.
- The README says "Barad: fortress, in Sindarin". Sindarin *barad* is most commonly glossed as "tower", with "fort, fortress" also attested ([Eldamo](https://elfdict.com/w/barad/s)). Say "tower" or "tower, fortress".
- The README states a submission date of 2026-11-09. Any copy that implies a longer runway should be checked against it.

## 3. Positioning

Barad is a treasury wallet for DeFi positions on Stellar, built around one idea: a treasury should be able to retreat fast and advance slowly.

**Category.** A treasury wallet for DeFi positions on Soroban. It is not a general-purpose consumer wallet, and it is not "a policy library" (that describes the engine under it).

**Core insight.** Leaving a position reduces risk and is often urgent. Entering a position, approving a token or changing the rules adds risk and deserves more approvals. Stellar's classic multisig sets one threshold per operation category, so it cannot tell the two apart ([Stellar docs](https://developers.stellar.org/docs/glossary/multisig/)).

**Audience**

- **Primary:** people who operate or approve a treasury holding DeFi positions on Stellar, such as asset managers and DAO treasury teams.
- **Secondary:** RWA issuers and funds that manage reserves on Stellar.
- **The reader the page must also convince:** ecosystem reviewers and developers (grant delegates, OpenZeppelin and protocol teams) who judge credibility in minutes. They are served by the status and security sections, not by extra hype. Do not write for retail users.

**The story spine.** Use these four sentences, in this order, as the narrative of the page.

1. A treasury holds positions in DeFi protocols.
2. At 3 a.m. a stablecoin starts to lose its peg, and the operator on call has to get funds out now.
3. With a classic multisig, leaving and entering cost the same number of signatures, so the team picks a low threshold (anyone can add risk) or a high one (nobody can leave in time).
4. Barad lets one account require 1 signature to leave and more to enter, and enforces that inside the account's own contract.

**Headline candidates**

| Option | Line | Note |
| --- | --- | --- |
| A (recommended) | Leave with one key. Enter with many. | Concrete, short, says the whole idea |
| B | A treasury wallet that retreats fast and advances slowly. | Good as a subhead or manifesto line |
| C | Exit in one signature. Enter by consensus. | Avoid: "consensus" collides with the Stellar Consensus Protocol |

**Descriptive line under the headline.** "Barad is a treasury wallet for Soroban smart accounts. One operator can pull funds out of a DeFi position and back to the treasury; adding risk takes more signatures. The rule is enforced on-chain."

**What Barad is not.** It is not a custodian, it does not hold anyone's funds, it is not audited yet, and it is not an investment product.

## 4. Claims we can and cannot make

This matrix is the source of truth for every factual sentence on the page. It was built from the repository and from searches on 2 November 2026; the search was broad but not exhaustive, so phrase comparisons as "we found", never as "there is no".

| # | Claim | Status and evidence | Safe phrasing | Never say |
| --- | --- | --- | --- | --- |
| 1 | One signature to exit, M to enter, enforced by the account | Implemented in the policy contract and tested (README). Not yet demonstrated on testnet | "One signature to exit, M to enter, enforced by the account's own contract. Prototype." | "Live", "in production", "battle-tested" |
| 2 | Deny by default | Implemented (README) | "Anything not on the list is denied." | "Unhackable", "cannot be bypassed" |
| 3 | Conditions on function and arguments | Implemented (Eq, OneOf, EqSelf, Range). Not unique: [Perch](https://github.com/stellar-registry/perch) expresses function and argument constraints, for example "argument 1 is the account itself", and [Mandate](https://github.com/SoroMandate/Mandate) filters by contract and function | "Conditions on the function and its arguments, such as 'the destination is the treasury'." | "First", "only", "nobody else does this" |
| 4 | OpenZeppelin's rules scope by contract only | True per the [RC v0.7.0 audit](https://www.openzeppelin.com/news/stellar-contracts-rc-v0.7.0-audit), about six months old; the team recorded a roadmap check on 2026-11-02 in `docs/validations.md` | "OpenZeppelin's context rules scope by contract address (per its v0.7.0 audit)." Keep the source and date | An undated statement of current fact |
| 5 | Audited | **False.** No audit has happened | "External audit planned." | "Audited", "audit-ready" |
| 6 | Works with the wallets people already use | Partly. OpenZeppelin supports [delegated signers](https://docs.openzeppelin.com/stellar-contracts/accounts/signers-and-verifiers), including classic Stellar accounts, and Freighter exposes `signAuthEntry`. But the Stellar CLI cannot yet sign for smart accounts ([#2762](https://github.com/stellar/stellar-cli/issues/2762)) and Stellar's docs say full client support is still under development | "Sign with a Stellar account you already use. Freighter extension is the first target." Only after the demo is verified | "Works with every Stellar wallet" |
| 7 | Non-custodial, enforced on-chain | True by design: the rule runs in the account contract. MPC custodians run policy engines on their own servers; Fireblocks documents [contract-call method rules](https://support.fireblocks.io/hc/en-us/articles/19159828875164-Policy-rules-for-specific-contract-call-methods) for EVM, and we found no Soroban documentation | "Enforced by your account's contract, not by a vendor's server." | "More secure than \[vendor\]" |
| 8 | Readable policies; lint and diff | The viewer is real over demo data; `lint` and `diff` work offline; `simulate` and `apply` are stubs | "Read the policy in plain language. Lint and diff it before you sign." | Anything implying simulate or apply work |
| 9 | Presets for protocols | Not real. Candidates are unverified | "Protocol presets are on the roadmap." | Naming a protocol as supported |
| 10 | Fork, fuzz and invariant testing | Not added yet. 14 unit and property tests exist | "14 tests today; fork, fuzz and invariant tests are planned." | "Extensively tested" |
| 11 | Built on OpenZeppelin smart accounts | True (`stellar-accounts` 0.8.0) | "Built on OpenZeppelin's `stellar-accounts`." | "Partnered with", "endorsed by" |
| 12 | Users, TVL, volume, design partners | None confirmed | Omit | Any number, logo or quote |
| 13 | Grants and the Stellar Development Foundation | Nothing awarded at the time of writing | If awarded: "recipient of an SCF award" plus the required disclaimer (section 11) | "Backed by SDF", "official Stellar partner" |
| 14 | Open source | True, MIT | "Open source, MIT license." |  |

**How the Perch finding changes the story.** Perch is a policy layer for the same OpenZeppelin accounts, with a declarative policy document, function and argument constraints and an analysis prover, and it is Apache-2.0. Its README labels it "design phase" and its motivating case is a CI key, not a treasury. Barad's honest edge is therefore not "the only engine with argument conditions". It is the product built around the entry and exit asymmetry: a treasury wallet that makes that rule easy to set, read, review and operate. Write the page around that.

## 5. Competitive context

The page should compare approaches, not attack products: the honest case is that each alternative solves part of the problem and none was found that makes the entry and exit asymmetry easy for a treasury team.

| Approach | Examples found | Strength | Gap for entry versus exit | How the page treats it |
| --- | --- | --- | --- | --- |
| Classic Stellar multisig | LOBSTR Vault, Stellar Stratum | Native, simple, widely supported | One threshold per operation category | State it plainly as the starting problem |
| Contract-level rules in smart accounts | OpenZeppelin `stellar-accounts`, Smart Account Kit | Framework with signers, thresholds and spending limits; had an external audit of its RC v0.7.0 | Rules scope by contract address, not function or arguments (per that audit) | Credit it as the foundation Barad builds on |
| Policy libraries | Perch, Mandate, Policywright | Function and argument constraints; reviewable policy documents; policy generation | Libraries and toolchains, not treasury wallets; maturity varies (Perch calls itself design phase) | Do not disparage. Position Barad as a product layer that can interoperate |
| Treasury applications | VaultDAO, Smart Treasury Account (an SCF submission) | Roles, timelocks, spending limits and payment workflows for organizations | We found no entry and exit semantics for DeFi positions | Say Barad is for DeFi positions, not payroll |
| Protocol-level roles | DeFindex vault roles (Manager, Emergency Manager, Rebalance Manager), Templar vault roles | Emergency exit roles built into the protocol | Exist only where each protocol builds them, and differ per protocol | Present as complementary: Barad applies the same idea at the account level |
| MPC custody with policy engines | Fireblocks, Dfns, BitGo | Mature operations, approval workflows | Policy is enforced off-chain by the vendor | State the difference factually; never claim superiority |
| Safe with Zodiac Roles (Ethereum) | The model asset managers use on Ethereum | Scoped permissions per contract, function and argument | Not on Stellar | Use as the reference for the problem, not as an equivalence claim |

**Dimensions for the comparison section on the page.** Where the rule is enforced; whether it distinguishes entry from exit; whether it can condition on function and arguments; whether it is built for DeFi positions; maturity. Fill each cell only with what the sources support, link the source, and mark unknowns as "not documented".

Page-level rule: never write that a competitor "lacks" a feature unless a source supports it and the sentence carries a date, for example "as of November 2026".

## 6. Messaging architecture

The page earns trust by being specific and honest about status, since there is no traction to show: the proof is the open code, the tests that exist, the threat model and a demo anyone can try.

### Hero

- **Status badge:** "Early prototype · testnet demo in progress". Neutral styling, always visible above the fold.
- **Headline:** "Leave with one key. Enter with many."
- **Subhead:** the descriptive line from section 3.
- **Primary call to action:** "Try to move the treasury", which scrolls to the interactive demo.
- **Secondary:** "Read the spec". **Tertiary text link:** the GitHub repository.
- **Hero visual:** one treasury block with a wide opening on the left labeled "Exit: 1 signature" and a narrow gate on the right labeled "Enter: 3 signatures". Static, readable without animation.

### Five pillars

| Pillar | One-sentence proof | Where it is shown |
| --- | --- | --- |
| Retreat fast | Exit rules need one operator signature, and funds can only return to the treasury | Demo cases 1 and 2 |
| Advance slowly | Entering, approving a token and changing the rules need more signatures | Demo cases 3 to 5 |
| Deny by default | If a call is not on the list, it does not happen | Policy viewer |
| Readable before you sign | Policies render in plain language; lint and diff catch loose rules | Policy viewer and CLI block |
| Enforced by the account | The rule runs in your account's contract, not on a vendor's server | Architecture diagram |

### Objections and answers (source for the FAQ)

| Question | Answer to give |
| --- | --- |
| Why not a normal multisig? | Stellar's classic thresholds are set per operation category, so leaving and entering a position cost the same signatures |
| Why not a custody provider's policy engine? | Those engines run on the vendor's infrastructure and are mature operationally. Barad's rules are enforced by your account's contract. Choose by what you want to trust |
| OpenZeppelin already has policies | Yes, and Barad is built on them. Per its v0.7.0 audit, OpenZeppelin's context rules scope by contract address. Barad adds function and argument conditions and the entry and exit structure. Libraries such as Perch and Mandate also exist, and Barad is meant to sit alongside them |
| Is it audited? | No. An external audit is planned. The code is open and the page lists what is tested today |
| What if an operator key is stolen? | The key can only call listed exit functions and only send funds back to the treasury. It cannot enter a position, approve a token or change the rules. It can still force exits, which has a cost; caps and delays are on the roadmap |
| Which wallets can sign? | A Stellar account you already use can be a delegated signer; the Freighter extension is the first target. Client support for smart accounts is still maturing |
| Is it on mainnet? | No. A testnet demo is in progress |
| Which protocols are supported? | None yet. Presets are on the roadmap, and protocols will be named only once verified |
| What does it cost? | It is open source under the MIT license |
| Who is behind it? | Name the team only with the team's written confirmation (see section 14) |

### Proof without traction

Use transparency as the proof: a "what is real today" table, the public repository, the number of tests, the threat model and, once they exist, testnet transactions for the demo cases. Never add placeholder logos, invented metrics or testimonials.

## 7. Page structure

The landing page is one scrolling route with the sections below, in this order. The wallet prototype lives on its own route and carries a permanent "Demo data" banner.

**Routes:** `/` landing page; `/app` the prototype wallet UI; `/docs` redirects to the spec in the repository.

### 7.1 Navigation

- Wordmark "Barad" with a small tower mark; links: How it works, Demo, Security and status, Docs, GitHub.
- One button: "Open the prototype", which goes to `/app`. Never "Launch app" or "Get started", which imply a product in use.

### 7.2 Hero

As specified in section 6. The status badge sits directly above the headline.

### 7.3 The problem

- A three-step horizontal timeline labeled "Illustrative scenario": 03:12 a stablecoin starts to lose its peg; 03:14 the operator on call exits with one signature and the funds return to the treasury; 03:40 anything new waits for three approvals.
- Below it, a two-row comparison: a classic 2-of-3 multisig needs 2 signatures to exit and 2 to enter; Barad's example policy needs 1 to exit and 3 to enter. Link the Stellar multisig documentation.

### 7.4 Interactive demo

The centerpiece. Full specification in section 8. It sits directly after the problem so the reader tests the idea within one screen of scrolling.

### 7.5 How it works

- The architecture diagram: three signer groups, the ADMIN, EXIT and ENTRY rules inside the smart account, the policy contract that checks every call, and the CLI that prepares configurations. Reuse the diagram from the proposal as an accessible SVG component.
- Under it, the evaluation steps in plain words: read the call; find the contract on the list; find the function; check every condition; allow or deny, and nothing else.

### 7.6 What a policy looks like

- Two columns. Left: a real example from the repository's `examples/` folder. Right: the same policy rendered in plain language by the policy viewer, for example "One operator may call the exit function on this protocol, only if the destination is the treasury."
- Placeholder addresses stay visibly placeholders.

### 7.7 Tooling

- Show real terminal output from `roles lint` and `roles diff` run on the example files. Capture it by running the commands; do not write it by hand.
- List `simulate` and `apply` under "coming", with one line each saying what they need.

### 7.8 Why not the alternatives

The comparison of approaches from section 5, each cell sourced and dated. Collapsible rows are fine. No competitor logos.

### 7.9 Security and status

- The "what is real today" table from section 2, kept in sync with the repository.
- A short threat summary with the honest limit: a stolen operator key can force exits, which has a cost, and caps and delays are planned.
- The audit plan, the license, and a link to the specification and the validations log.

### 7.10 Who it is for

Three cards: asset managers, DAO treasuries, RWA issuers. Each states the situation and the rule they would set. No adoption claims, no logos.

### 7.11 Roadmap

Three columns: **Done** (policy contract, CLI lint and diff, UI shell), **Next** (testnet deployment and the four demo cases, verified protocol presets, fork, fuzz and invariant tests with CI), **Later** (external audit, mainnet, timelocks and caps, a review interface). No dates; "planned" only.

### 7.12 FAQ

The questions and answers from section 6, as an accessible accordion.

### 7.13 Closing

"Follow the build": GitHub, the specification, a contact address once the team provides one. Do not add an email capture form without approval.

### 7.14 Footer

License, the disclaimers from section 11, and links.

## 8. Interactive demo specification

"Try to move the treasury" lets a reader feel the entry and exit asymmetry in thirty seconds. It is a simulation that runs in the browser and mirrors the policy's semantics. It must say so on screen: "Simulated in your browser. Not a live treasury. A testnet version is coming."

### 8.1 The fixed example

| Rule | Who may sign | Threshold | What it allows |
| --- | --- | --- | --- |
| EXIT | Operators O1, O2 | 1 signature | `withdraw` on the example protocol, only if the destination is the treasury |
| ENTRY | Operators O1, O2 and approvers A1, A2, A3 | 3 signatures | `deposit` on the example protocol, plus the token `transfer` and `approve` calls it needs |
| ADMIN | Governance G1, G2, G3 | 2 signatures | Adding or removing rules and installing policies |

For comparison, a "classic multisig" toggle applies one 2-of-3 threshold to every action and does not look at where the funds go.

### 8.2 Actions the reader can try

1. Exit the position to the treasury.
2. Exit the position to an outside address.
3. Enter the position.
4. Approve token spending.
5. Change the rules.

### 8.3 Evaluation (a pure function)

Implement `evaluate(state, signedKeys, action)` in a standalone module with no network and no wallet. It returns whether the action is approved, which rule applied, how many signatures counted against how many were required, a one-sentence reason and the evaluation steps.

1. Choose the rule from the action: exit uses EXIT; enter and approve use ENTRY; change the rules uses ADMIN.
2. Count only the signed keys that belong to that rule's signer set. Other keys are shown as ignored.
3. Check the policy: the function must be on the list, and every argument condition must hold.
4. Compare the counted signatures with the threshold.
5. Deny on the first failure and say which step failed; approve only if all steps pass.

&#91;embedded content: How the demo evaluates an action\]

Only the policy check and the threshold check can deny, and each denial must show its own reason.

### 8.4 Required test cases

These cases must pass as unit tests and as end-to-end tests of the interface.

| # | Signed by | Action | Result | Reason to show |
| --- | --- | --- | --- | --- |
| 1 | O1 | Exit to the treasury | Approved | EXIT rule, 1 of 1 required signature; funds return to the treasury |
| 2 | O1 | Exit to an outside address | Denied | The exit rule only allows the treasury as destination, even though the signature is valid |
| 3 | O1 | Enter the position | Denied | ENTRY needs 3 signatures; 1 counted |
| 4 | O1, A1, A2 | Enter the position | Approved | ENTRY rule, 3 of 3 |
| 5 | O1 | Approve token spending | Denied | Approving a token needs the ENTRY threshold; 1 of 3 |
| 6 | O1 | Change the rules | Denied | Only governance keys count for ADMIN; 0 of 2 |
| 7 | G1, G2 | Change the rules | Approved | ADMIN rule, 2 of 3 |
| 8 | A1 | Exit to the treasury | Denied | A1 is not an EXIT signer; 0 counted |

In classic multisig mode, cases 1 and 3 both need 2 signatures, and case 2 is approved if 2 keys sign, because the signatures do not look at the destination.

### 8.5 Interface

- Two panels: "Who signs" (toggle chips for the eight keys) and "What they try to do" (five action cards).
- Result panel: a large "Approved" or "Denied" with a text label and an icon, a signature meter (counted of required), the rule name and the one-sentence reason. An expandable "Why" lists the evaluation steps.
- Two shortcut buttons: "A 3 a.m. exit" (case 1) and "A stolen operator key" (case 2).
- State in the URL query string so a result can be shared.
- Keyboard operable; the result is announced politely to screen readers; color is never the only signal; respects reduced motion.
- Copy for results lives in one file so it can be edited without touching logic.

## 9. Visual and brand direction

The look should read as a well-made engineering manual, not as a crypto landing page: calm, exact, and institutional without being corporate.

**Concept.** A tower with a wide exit and a narrow gate. The idea of the product is asymmetry, so make asymmetry visible and architectural: rules stacked like masonry, a doorway wide on one side and narrow on the other.

**The name and its associations.** *Barad* is Sindarin for "tower", also glossed "fort, fortress" ([Eldamo](https://elfdict.com/w/barad/s)). Its best-known use is Barad-dûr, Sauron's Dark Tower. Keep the name, and avoid everything that evokes that tower or the books: no burning eye, no lava or Mordor palette, no gothic spires, no Tolkien names, places, quotes or scripts. Aim for a calm lookout, not a menacing fortress.

**Palette** (starting tokens; verify contrast, 4.5:1 for text and 3:1 for interface elements)

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#101418` | Text and dark surfaces |
| Paper | `#F6F4EF` | Default background (warm off-white) |
| Stone | `#8A8F98` | Secondary text and icons |
| Line | `#D9D6CE` | Hairlines and borders |
| Lamp | `#C9822B` | The one brand accent: highlights and primary button fills, with Ink text on top. Never as text on Paper |
| Approved | `#1F8A70` | Approved states in the demo, always with a label and an icon |
| Denied | `#B3412F` | Denied states in the demo, always with a label and an icon |

**Typography.** At most three families, self-hosted, `font-display: swap`. A sturdy serif for headlines (for example Fraunces or Newsreader), a neutral sans for text and interface (Inter or IBM Plex Sans), and a monospace for policies and terminal output (JetBrains Mono or IBM Plex Mono). Hero headline 56 to 72 px on desktop and 36 to 44 px on mobile; body lines no longer than 70 characters.

**Layout.** Twelve-column grid, maximum width about 1120 px, generous vertical space, sections separated by hairlines instead of gradients.

**Imagery.** Diagrams, not illustrations. No stock photos, 3D coins, shields, padlocks, neon gradients, glass cards or particle backgrounds.

**Logo.** A wordmark in the headline serif, with a small mark: a square tower outline with an asymmetric doorway, wide at the base on the left and a narrow slit on the right. It must stay legible at 16 px and work in one color.

**Motion.** Quiet. The demo result transitions in 150 to 250 ms. Respect `prefers-reduced-motion`. No carousels, parallax or autoplay.

**Components to build.** Status badge, signature meter (a segmented bar showing counted of required), rule card, policy viewer, terminal block, comparison table, accordion, and an "Honest limit" callout used wherever a section states what is not done yet.

**Themes.** Light by default. Dark theme is P3.

## 10. Copy guidelines

The current copy was described as shallow. The usual cause is adjectives standing in for mechanisms. Fix it by naming the mechanism, the number or the scenario in every sentence that makes a claim.

**Voice.** Plain, precise and calm. Second person. Short sentences, usually under 20 words. Sentence case in headings. No exclamation marks and no emoji.

**Rules**

1. Lead with the scenario, then the mechanism, then the claim.
2. One idea per sentence. Paragraphs of at most three sentences.
3. Replace an adjective with what is checked or counted. "Secure" never stands alone.
4. Say what is not done. Use the "Honest limit" callout where a section touches an unfinished part.
5. Use one word per concept. Define Soroban and smart account once, in plain words, near the top.
6. Every comparison carries a source and a date.

**Glossary (use these terms only)**

| Term | Meaning |
| --- | --- |
| Treasury | The smart account that holds the funds |
| Operator | A key that may exit a position |
| Approver | A key that helps approve entries |
| Governance | The keys that may change the rules |
| Rule | EXIT, ENTRY or ADMIN: who may sign, how many, and what it allows |
| Policy | The contract that checks every call against the rule |
| Exit and enter | Leaving and joining a DeFi position |

**Words to avoid:** revolutionary, seamless, next-generation, cutting-edge, military-grade, bank-grade, unhackable, robust, powerful, empower, unlock, supercharge, Web3, and "trustless" unless defined. Also avoid "secure" without a mechanism, and any claim of trust, partnership or scale.

**Before and after**

| Shallow (illustrative) | Specific |
| --- | --- |
| "Barad is a secure, next-generation wallet for institutional DeFi." | "Barad is a treasury wallet. One operator can pull funds out of a DeFi position and back to the treasury; adding risk takes more signatures." |
| "Military-grade security with audited smart contracts." | "The policy contract is open source and has 14 tests. An external audit is planned." |
| "Seamless integration with all Stellar wallets." | "Sign with a Stellar account you already use. The Freighter extension is the first target." |
| "Granular permissions for total control." | "A call is allowed only if its contract, function and arguments are on the list. Everything else is denied." |
| "Protect your treasury from threats." | "If an operator key is stolen, the thief can only send funds back to the treasury." |
| "Trusted by leading teams." | Delete it. There is no traction to claim |

**Microcopy for status**

| Where | Text |
| --- | --- |
| Hero badge | Early prototype · testnet demo in progress |
| Wallet UI banner | Demo data. No live treasury is connected |
| Demo caption | Simulated in your browser. Not a live treasury |
| Roadmap item not started | Planned |
| Any number not backed by a source | Do not show it |

## 11. Legal and brand guardrails

These are working guardrails, not legal advice. Have counsel review the name, the disclaimers and the comparison table before launch.

| Area | Guardrail |
| --- | --- |
| Stellar marks | Stellar's [brand policy](https://stellar.org/brand-policy) says its marks may not be used in or as part of a trade name, trademark, domain name, account name or social media name without written consent. So rename the engine "Stellar Roles" (suggestion: "Barad Roles"), keep "stellar" out of domains and handles, do not use the Stellar logo as part of Barad's logo, and use only descriptive phrases such as "built on Stellar". The repository name `barad-stellar-wallet` is the team's call; check it |
| SCF and SDF | Do not write "Backed by SDF", "SDF-approved" or "official Stellar partner", and do not use the SDF logo. If an SCF award is granted, say "recipient of an SCF award" with the disclaimer the handbook requires; its [Integration Track page](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track) lists the text and the content restrictions, and the team must confirm which version applies to its track. Those restrictions also bar financial framing in award-funded content, so avoid "yield", "returns" and "earn" |
| OpenZeppelin | Say "built on OpenZeppelin's `stellar-accounts`" and nothing that implies endorsement. No logo. Check the dependency's license before copying any text or code from its documentation |
| Tolkien | *Barad* is a common noun in a constructed language, but Middle-earth names, places, characters, film imagery and stylized lettering belong to others. No Barad-dûr, no Eye, no Mordor or Gondor, no quotations, no Tengwar or Cirth lettering as a brand element, no fan art. The searches run for this brief found no obvious product named Barad Wallet, but that was not a trademark search; run a formal one |
| Named people and partners | No names, logos or quotes of partners, investors, customers or advisers without their written approval. Nothing on the page, in the repository or in metadata may point to a specific design partner or to anyone who gave informal advice |
| Competitors | Compare factually, cite and date each source, no logos, no disparagement, no statements about a competitor's security |
| Financial | Experimental software; not financial advice; not an investment product; testnet and demo data only. Do not publish yields, returns or performance figures |
| Privacy | No analytics, cookies or third-party scripts without consent. Freighter connect stays read-only, and the page never asks for a secret key. No email capture without approval and a privacy notice |

**Suggested footer text.** "Barad is experimental open-source software, currently an early prototype that runs on demo data. It is not financial advice and has not been audited. Barad is an independent project built on Stellar and on OpenZeppelin's stellar-accounts; it is not endorsed by the Stellar Development Foundation or OpenZeppelin. Barad is a Sindarin word; this project is not affiliated with the Tolkien Estate."

## 12. Technical requirements

Keep the existing Next.js and pnpm workspace. The changes below make the page easy to edit honestly and hard to break.

**Structure**

- Marketing in the route group `app/(marketing)` and the wallet prototype in `app/(app)`. Design tokens in one file; components do not hard-code colors.
- Copy lives in typed content files, not inside components.
- Create `claims.ts`: every factual statement on the page references a claim id that maps to a row of the matrix in section 4. Add `status.ts` with the "what is real today" data, used by both the page and the README status section so they cannot drift.
- Add `scripts/check-claims.ts` and run it in CI. It fails the build if page text contains "audited" without "not" or "planned" nearby, "backed by", "trusted by", "partner" or "official", or any word from the avoid list in section 10.

**Quality targets**

| Area | Target |
| --- | --- |
| Performance | Largest Contentful Paint 2.5 s or less on a mid-range phone over 4G; layout shift 0.1 or less; JavaScript for `/` at most 200 KB gzipped, with the demo and everything below the fold loaded lazily |
| Accessibility | WCAG 2.2 AA; full keyboard use; visible focus; skip link; the demo result announced politely; checked with axe and a manual screen-reader pass |
| Tests | Vitest for `evaluate` with the eight cases in section 8; Playwright for the demo and the main flows; Lighthouse CI with Performance at least 90 and Accessibility at least 95; a link checker |
| Privacy | No third-party scripts, no cookies, fonts self-hosted |
| Internationalization | English only now; structure the copy files so a Portuguese version can be added later |

**Search and sharing**

- Title: "Barad: a treasury wallet that retreats fast, advances slowly" (60 characters or fewer).
- Meta description (155 characters or fewer): "A treasury wallet for Soroban smart accounts: one signature to exit a DeFi position, more to enter. Early prototype, open source."
- Open Graph image 1200 by 630 px built from the hero visual; canonical URL; sitemap and robots file.

**Repository hygiene**

- Rewrite the first lines of `README.md` to remove "audited" and to state the prototype status; link to the page.
- The GitHub repository description can only be changed by the owner. Suggested text: "Barad: an early-prototype treasury wallet for Soroban smart accounts. 1 signature to exit a DeFi position, more to enter. Open source (MIT)."
- Do not change the domain, the repository name or the npm scopes without approval.

## 13. Acceptance checklist

Report each item as pass or fail in your final message, with the file or URL that proves it.

**Facts**

- [ ] The words "audited" or "audit-ready" appear nowhere as a claim: not in the page, the README, the metadata or the repository description text you prepare.
- [ ] Every factual sentence maps to a claim id in `claims.ts`, and every id maps to a row of section 4.
- [ ] The hero status badge is visible without scrolling, and the wallet UI shows a "Demo data" banner on every screen.
- [ ] No partner, customer, investor or person is named, and no logo that the team does not own appears.
- [ ] No number appears without a source or without a "demo data" label.
- [ ] Comparisons are dated and sourced, and no competitor is said to "lack" a feature without a source.

**Messaging**

- [ ] The headline is "Leave with one key. Enter with many." or an approved alternative from section 3.
- [ ] A reader can state the product's idea after reading only the hero.
- [ ] None of the words in the avoid list of section 10 appears.
- [ ] "Soroban" and "smart account" are defined in plain words once, near the top.
- [ ] The "Honest limit" callout appears in the security section and next to every unfinished feature.

**Demo**

- [ ] All eight cases in section 8 pass as unit tests and as end-to-end tests.
- [ ] The classic multisig toggle reproduces the contrast described in section 8.
- [ ] The caption "Simulated in your browser" is always visible.
- [ ] The result is announced to screen readers and is understandable without color.

**Design**

- [ ] No Tolkien names, imagery or lettering; no eye, lava or gothic motifs.
- [ ] Palette and type follow section 9, and text contrast passes WCAG 2.2 AA.
- [ ] The page works without animation and respects reduced motion.

**Engineering**

- [ ] `scripts/check-claims.ts` runs in CI and fails on a seeded violation.
- [ ] Lighthouse CI meets the targets in section 12, and axe reports no serious issues.
- [ ] No third-party scripts, cookies or email capture were added.
- [ ] `docs/marketing-audit.md` lists every claim found in the old copy with its fix.

## 14. Open questions for the team

Answer these before launch. Where a question is unanswered, the page uses the conservative default shown.

| Question | Conservative default until answered |
| --- | --- |
| What exactly does Barad hold? Today it appears to be an interface over a smart account, with signing done by an existing wallet such as Freighter | Say "treasury wallet" only if the team defines it that way; otherwise use "treasury console", and state that keys stay in the signer's own wallet |
| Does the page name the team, and is a contact address available? The repository owner is public on GitHub | Do not name the team on the page; omit the contact address |
| What is the final name of the policy engine? | "Barad Roles" in place of "Stellar Roles" |
| Which domain will host the page? | No domain change; deploy to the current host |
| Which protocol will the testnet demo use? | Name none until verified |
| Is signing with the Freighter extension verified in the prototype? | Say "first target", not "supported" |
| Are roadmap dates allowed? | "Planned", no dates |
| Is an early-access or email form wanted? | None |
| Should a Portuguese version ship? | English only; copy structured for later translation |
| Which deadline governs the page? The README states a submission date of 2026-11-09 | Ship P0 and P1 first, then P2 and P3 |

## 15. References

Pages read on 2 November 2026. Re-check any source before quoting it; maturity of third-party projects was not verified, and the searches were broad but not exhaustive.

**The Barad repository**

- [bleu/barad-stellar-wallet](https://github.com/bleu/barad-stellar-wallet): README, status, layout (the `frontend` folder could not be read automatically; inspect it directly).

**Stellar and Soroban**

- [Stellar multisig: thresholds per operation category](https://developers.stellar.org/docs/glossary/multisig/)
- [Signing Soroban invocations](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations)
- [Delegate auth example (client support still developing)](https://developers.stellar.org/docs/build/smart-contracts/example-contracts/delegate-auth)
- [Stellar CLI issue #2762: smart account support](https://github.com/stellar/stellar-cli/issues/2762)
- [Developer meeting 2026-08-20: Wallets Kit works with classic accounts only; Passkey Kit and Smart Account Kit](https://developers.stellar.org/meetings/2026/08/20)
- [Stellar brand policy](https://stellar.org/brand-policy)
- [SCF Handbook: Integration Track (disclaimer and content restrictions)](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track)

**OpenZeppelin**

- [stellar-contracts: accounts](https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/accounts)
- [Context rules](https://docs.openzeppelin.com/stellar-contracts/accounts/context-rules) and [policies](https://docs.openzeppelin.com/stellar-contracts/accounts/policies)
- [Signers and verifiers (delegated signers)](https://docs.openzeppelin.com/stellar-contracts/accounts/signers-and-verifiers)
- [RC v0.7.0 audit](https://www.openzeppelin.com/news/stellar-contracts-rc-v0.7.0-audit)
- [Smart Account Kit](https://github.com/stellar/smart-account-kit)

**Alternatives and related projects**

- [Perch](https://github.com/stellar-registry/perch) (policy layer, design phase per its README)
- [Mandate](https://github.com/SoroMandate/Mandate), [Policywright](https://github.com/kunaldrall29/policywright)
- [VaultDAO](https://github.com/Calebux/VaultDAO), [Smart Treasury Account](https://communityfund.stellar.org/submissions/recmj5cqlrqKyd1Bc)
- [DeFindex vault roles](https://docs.defindex.io/whitepaper/10-whitepaper/02-contracts/01-vault-contract), [Templar vault runtime](https://github.com/Templar-Protocol/contracts/blob/dev/contract/vault/soroban/README.md)
- [Fireblocks: contract call method rules](https://support.fireblocks.io/hc/en-us/articles/19159828875164-Policy-rules-for-specific-contract-call-methods)
- [LOBSTR Vault](https://vault.lobstr.co/), [Stellar Stratum](https://github.com/yripper/stellar-stratum)

**Name**

- [Eldamo: Sindarin *barad*](https://elfdict.com/w/barad/s) and [Barad-dûr](https://tolkiengateway.net/wiki/Barad-dur)
