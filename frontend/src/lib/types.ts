// Mirrors crates/roles-config/src/lib.rs. Kept in plain, JSON-friendly shapes
// (amounts as strings, since JS numbers can't hold i128) so the same types
// can later be produced by reading a deployed RolesPolicy's `get_config`.

export type Mode = "Exit" | "Entry";

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

export interface Target {
  contract: string;
  label?: string;
  fns: FnRule[];
}

export interface RolesConfig {
  mode: Mode;
  targets: Target[];
}

export interface Signer {
  address: string;
  label?: string;
}

export type RuleKind = "Admin" | "Exit" | "Entry";

export interface ContextRule {
  id: number;
  kind: RuleKind;
  name: string;
  threshold: number;
  signers: Signer[];
  protocolLabel?: string;
  /** Only Exit/Entry rules install a RolesPolicy. */
  config?: RolesConfig;
}

export interface SmartAccount {
  id: string;
  label: string;
  network: "testnet" | "mainnet";
  rules: ContextRule[];
}
