// Mirrors crates/roles-config/src/lib.rs. Amounts are kept as decimal
// strings, not JS numbers, since they may exceed Number.MAX_SAFE_INTEGER
// (the contract reads them as i128).

export type Mode = "exit" | "entry";

export type CondValueType = "u32" | "i128" | "address" | "symbol";

export interface CondValue {
  type: CondValueType;
  value: string;
}

export type Cond =
  | { op: "eq"; arg: number; type: CondValueType; value: string }
  | { op: "one_of"; arg: number; type: CondValueType; values: string[] }
  | { op: "eq_self"; arg: number }
  | { op: "range"; arg: number; min: string; max: string };

export interface FnRule {
  name: string;
  cond: Cond[];
}

export interface Target {
  contract: string;
  label?: string;
  fn: FnRule[];
}

/** One context rule's worth of config, as read from a `[[rule]]` TOML block. */
export interface RuleConfig {
  name: string;
  mode: Mode;
  threshold: number;
  signers: string[];
  target: Target[];
}

export interface ConfigFile {
  account: { address: string };
  rule: RuleConfig[];
}
