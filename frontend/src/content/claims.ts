/**
 * Every factual claim the landing page is allowed to make, transcribed from
 * "Barad landing page design and messaging specification.md", section 4.
 * Page copy references a claim by id (see `copy/*.ts`); `scripts/check-claims.ts`
 * and the claims themselves are the only places that should ever need editing
 * when a fact changes.
 */
export interface Claim {
  id: string;
  claim: string;
  status: string;
  safePhrasing: string;
  neverSay: string[];
}

export const claims: Record<string, Claim> = {
  "exit-1-enter-m": {
    id: "exit-1-enter-m",
    claim: "One signature to exit, M to enter, enforced by the account",
    status:
      "Implemented in the policy contract and tested. Not yet demonstrated on testnet.",
    safePhrasing:
      "One signature to exit, M to enter, enforced by the account's own contract. Prototype.",
    neverSay: ["live", "in production", "battle-tested"],
  },
  "deny-by-default": {
    id: "deny-by-default",
    claim: "Deny by default",
    status: "Implemented.",
    safePhrasing: "Anything not on the list is denied.",
    neverSay: ["unhackable", "cannot be bypassed"],
  },
  "function-arg-conditions": {
    id: "function-arg-conditions",
    claim: "Conditions on function and arguments",
    status:
      "Implemented (Eq, OneOf, EqSelf, Range). Not unique — Perch and Mandate also express function/argument constraints.",
    safePhrasing:
      "Conditions on the function and its arguments, such as “the destination is the chest.”",
    neverSay: ["first", "only", "nobody else does this"],
  },
  "openzeppelin-contract-scope-only": {
    id: "openzeppelin-contract-scope-only",
    claim: "OpenZeppelin's rules scope by contract only",
    status:
      "True per the RC v0.7.0 audit (~6 months old); re-checked 2026-11-02, still true as of stellar-accounts 0.8.0 and not on OpenZeppelin's public roadmap through v1.0.0.",
    safePhrasing:
      "OpenZeppelin's context rules scope by contract address (per its v0.7.0 audit, re-checked 2026-11-02).",
    neverSay: ["an undated statement of current fact"],
  },
  audited: {
    id: "audited",
    claim: "Audited",
    status: "False. No audit has happened.",
    safePhrasing: "External audit planned.",
    neverSay: ["audited", "audit-ready"],
  },
  "works-with-existing-wallets": {
    id: "works-with-existing-wallets",
    claim: "Works with the wallets people already use",
    status:
      "Partly. OpenZeppelin supports delegated signers including classic Stellar accounts; Freighter exposes signAuthEntry. The Stellar CLI cannot yet sign for smart accounts, and full client support is still under development.",
    safePhrasing:
      "Sign with a Stellar account you already use. Freighter extension is the first target.",
    neverSay: ["works with every Stellar wallet"],
  },
  "non-custodial-onchain": {
    id: "non-custodial-onchain",
    claim: "Non-custodial, enforced on-chain",
    status:
      "True by design: the rule runs in the account contract, not on a vendor's server.",
    safePhrasing: "Enforced by your account's contract, not by a vendor's server.",
    neverSay: ["more secure than [vendor]"],
  },
  "readable-lint-diff": {
    id: "readable-lint-diff",
    claim: "Readable policies; lint and diff",
    status:
      "The viewer is real over demo data; lint and diff work offline; simulate and apply are stubs.",
    safePhrasing: "Read the policy in plain language. Lint and diff it before you sign.",
    neverSay: ["anything implying simulate or apply work"],
  },
  "protocol-presets": {
    id: "protocol-presets",
    claim: "Presets for protocols",
    status: "Not real. Candidates are unverified.",
    safePhrasing: "Protocol presets are on the roadmap.",
    neverSay: ["naming a protocol as supported"],
  },
  "test-coverage": {
    id: "test-coverage",
    claim: "Fork, fuzz and invariant testing",
    status: "Not added yet. 14 unit and property tests exist.",
    safePhrasing: "14 tests today; fork, fuzz and invariant tests are planned.",
    neverSay: ["extensively tested"],
  },
  "built-on-openzeppelin": {
    id: "built-on-openzeppelin",
    claim: "Built on OpenZeppelin smart accounts",
    status: "True (stellar-accounts 0.8.0).",
    safePhrasing: "Built on OpenZeppelin's stellar-accounts.",
    neverSay: ["partnered with", "endorsed by"],
  },
  "users-traction": {
    id: "users-traction",
    claim: "Users, TVL, volume, design partners",
    status: "None confirmed.",
    safePhrasing: "Omit.",
    neverSay: ["any number, logo, or quote"],
  },
  "grants-sdf": {
    id: "grants-sdf",
    claim: "Grants and the Stellar Development Foundation",
    status: "Nothing awarded at the time of writing.",
    safePhrasing: "If awarded: “recipient of an SCF award” plus the required disclaimer.",
    neverSay: ["backed by SDF", "official Stellar partner"],
  },
  "open-source": {
    id: "open-source",
    claim: "Open source",
    status: "True, MIT.",
    safePhrasing: "Open source, MIT license.",
    neverSay: [],
  },
} as const;

export type ClaimId = keyof typeof claims;
