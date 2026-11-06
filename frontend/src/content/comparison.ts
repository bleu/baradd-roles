// Transcribed from the spec, section 5. Checked 2 November 2026; searches
// were broad but not exhaustive — phrase gaps as "we found", never "there is
// no". Every cell traces to a source; nothing here claims a competitor
// "lacks" a feature without one.
export interface ComparisonRow {
  approach: string;
  examples: string;
  strength: string;
  gap: string;
  sourceUrl: string;
  sourceLabel: string;
}

export const comparisonRows: ComparisonRow[] = [
  {
    approach: "Classic Stellar multisig",
    examples: "LOBSTR Vault, Stellar Stratum",
    strength: "Native, simple, widely supported",
    gap: "One threshold per operation category",
    sourceUrl: "https://developers.stellar.org/docs/glossary/multisig/",
    sourceLabel: "Stellar docs, multisig",
  },
  {
    approach: "Contract-level rules in smart accounts",
    examples: "OpenZeppelin stellar-accounts, Smart Account Kit",
    strength:
      "Framework with signers, thresholds, and spending limits; had an external audit of its RC v0.7.0",
    gap: "Rules scope by contract address, not function or arguments (per that audit)",
    sourceUrl: "https://www.openzeppelin.com/news/stellar-contracts-rc-v0.7.0-audit",
    sourceLabel: "RC v0.7.0 audit",
  },
  {
    approach: "Policy libraries",
    examples: "Perch, Mandate, Policywright",
    strength:
      "Function and argument constraints; reviewable policy documents; policy generation",
    gap: "Libraries and toolchains, not treasury wallets; maturity varies (Perch calls itself design phase)",
    sourceUrl: "https://github.com/stellar-registry/perch",
    sourceLabel: "Perch README",
  },
  {
    approach: "Treasury applications",
    examples: "VaultDAO, Smart Treasury Account (an SCF submission)",
    strength: "Roles, timelocks, spending limits, and payment workflows for organizations",
    gap: "We found no entry/exit semantics for DeFi positions",
    sourceUrl: "https://github.com/Calebux/VaultDAO",
    sourceLabel: "VaultDAO",
  },
  {
    approach: "MPC custody with policy engines",
    examples: "Fireblocks, Dfns, BitGo",
    strength: "Mature operations, approval workflows",
    gap: "Policy is enforced off-chain by the vendor",
    sourceUrl:
      "https://support.fireblocks.io/hc/en-us/articles/19159828875164-Policy-rules-for-specific-contract-call-methods",
    sourceLabel: "Fireblocks: contract call method rules",
  },
  {
    approach: "Safe with Zodiac Roles (Ethereum)",
    examples: "The model asset managers use on Ethereum",
    strength: "Scoped permissions per contract, function, and argument",
    gap: "Not on Stellar",
    sourceUrl: "https://developers.stellar.org/docs/glossary/multisig/",
    sourceLabel: "reference point, not an equivalence claim",
  },
];
