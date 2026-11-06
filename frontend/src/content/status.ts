/**
 * "What is real today" — transcribed from the spec, section 2. Single
 * source for the landing page's security/status section and (by hand, for
 * now — see the audit) the README. Keep this in sync with the repository;
 * when something here changes, update README.md's Status section to match.
 */
export interface StatusRow {
  component: string;
  state: string;
  pageMayAsSay: string;
}

export const statusRows: StatusRow[] = [
  {
    component: "contracts/roles-policy",
    state:
      "Implemented against OpenZeppelin's stellar-accounts 0.8.0; 14 tests (11 unit, 3 property-based); builds to Wasm.",
    pageMayAsSay: "Implemented and tested. Not audited. Not deployed.",
  },
  {
    component: "@baradd/sdk and @baradd/cli: lint, diff",
    state: "Real, offline, work on local TOML files.",
    pageMayAsSay: "Lint and diff a policy before you sign it.",
  },
  {
    component: "@baradd/cli: simulate, apply",
    state: "Honest stubs that explain what infrastructure they need.",
    pageMayAsSay: "Not presented as working.",
  },
  {
    component: "frontend",
    state:
      "Next.js UI over illustrative data in mock-data.ts: chest dashboard, ADMIN/EXIT/ENTRY rule cards, plain-language policy viewer; Freighter connect is read-only.",
    pageMayAsSay: "Every figure labeled “demo data.” No live chest implied.",
  },
  {
    component: "Fork, fuzz and invariant tests; CI",
    state: "Not added yet.",
    pageMayAsSay: "Not claimed.",
  },
  {
    component: "External audit",
    state: "None. Soroban Audit Bank eligibility is unconfirmed.",
    pageMayAsSay: "Audit planned.",
  },
  {
    component: "Protocol presets",
    state: "None verified; candidates are unverified.",
    pageMayAsSay: "On the roadmap.",
  },
  {
    component: "Testnet and mainnet deployments",
    state: "None.",
    pageMayAsSay: "No addresses, TVL, or transactions shown.",
  },
  {
    component: "Users, design partners, traction",
    state: "None confirmed.",
    pageMayAsSay: "Not implied.",
  },
  {
    component: "License",
    state: "MIT",
    pageMayAsSay: "May be stated.",
  },
];

export const honestLimit =
  "If an operator key is stolen, the thief can only send funds back to the chest — they cannot enter a position, approve a token, or change the rules. They can still force exits, which has a cost; per-period caps and delays are planned, not built.";
