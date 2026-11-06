// Mirrors crates/roles-config/src/lib.rs, minus `mode`: the deployed
// roles-policy contract's `enforce()` never reads it (see
// contracts/roles-policy/src/eval.rs) — it's an inert label on the
// already-deployed contract's storage type, not a behavior. The app no
// longer asks the user to pick an Exit/Entry "kind"; every non-admin rule is
// just a contract + functions + argument conditions + who can authorize it.

export type CondValueType = "u32" | "i128" | "address" | "symbol";

export type CondValue =
  | { kind: "u32"; value: number }
  | { kind: "i128"; value: string }
  | { kind: "address"; value: string }
  | { kind: "symbol"; value: string };

export type Cond =
  | { kind: "Eq"; arg: number; value: CondValue }
  | { kind: "OneOf"; arg: number; values: CondValue[] }
  | { kind: "EqSelf"; arg: number }
  | { kind: "Range"; arg: number; min: string; max: string };

export interface FnRule {
  name: string;
  conds: Cond[];
}

/** A rule's one target contract and the functions on it this rule covers. */
export interface Target {
  contract: string;
  label?: string;
  fns: FnRule[];
}

export interface Signer {
  address: string;
  label?: string;
}

/**
 * Who can authorize this rule, independently of a signer's other
 * memberships: a Governance signer doesn't make someone eligible on an
 * Operator group, and vice versa. Each enabled role is its own
 * threshold-of-signers check; satisfying ANY one role group is enough —
 * they're independent paths, not pooled together. Maps 1:1 to a separate
 * on-chain context rule per enabled role (see lib/onchain/).
 */
export type SignerRole = "governance" | "admin" | "operator";

export interface RoleGroup {
  role: SignerRole;
  signers: Signer[];
  threshold: number;
}

/**
 * "Admin" is the one real structural distinction (it's a `Default`-type
 * context rule that can change rules/policies at all); every other rule is
 * just "Rule" — scoped to one contract, with its own role groups.
 */
export type RuleKind = "Admin" | "Rule";

export interface ContextRule {
  id: number;
  kind: RuleKind;
  name: string;
  roleGroups: RoleGroup[];
  /** Only present for kind "Rule" — Admin rules have no target contract. */
  target?: Target;
}

export interface SmartAccount {
  id: string;
  label: string;
  network: "testnet" | "mainnet";
  rules: ContextRule[];
}
