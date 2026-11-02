//! Shared configuration types for the `RolesPolicy` Soroban contract.
//!
//! Kept in its own crate so the policy's data shapes are reusable from test
//! harnesses without pulling in the contract's entry points.
#![no_std]

use soroban_sdk::{contracttype, Address, Symbol, Vec};

/// Initial hard limits (see docs/spec.md, "Storage, limits and costs").
/// Calibrate against a CPU/read benchmark before raising them.
pub const MAX_TARGETS_PER_RULE: u32 = 8;
pub const MAX_FNS_PER_TARGET: u32 = 8;
pub const MAX_CONDS_PER_FN: u32 = 4;

/// Whether a context rule governs leaving a position (`Exit`) or entering one
/// (`Entry`). Exit rules are meant to be paired with a 1-signature threshold,
/// entry rules with an M-signature threshold — the policy itself does not
/// enforce the signature count, only which calls are allowed.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Mode {
    Exit,
    Entry,
}

/// A typed literal an argument is compared against. Kept as a closed set of
/// variants (rather than an opaque `Val`) so equality can be checked with
/// `TryFromVal` on each side — generic `Val` equality requires the `std`
/// feature in `soroban-env-common` and is unavailable in a `no_std` wasm
/// contract build.
#[contracttype]
#[derive(Clone, Debug)]
pub enum CondValue {
    U32(u32),
    I128(i128),
    Address(Address),
    Symbol(Symbol),
}

/// A condition evaluated against a single positional argument of a function
/// call.
#[contracttype]
#[derive(Clone, Debug)]
pub enum Cond {
    /// Argument at index `u32` must equal the given value.
    Eq(u32, CondValue),
    /// Argument at index `u32` must be one of the given values.
    OneOf(u32, Vec<CondValue>),
    /// Argument at index `u32` must equal the smart account's own address.
    /// Typical use: "the destination of an exit transfer is the account
    /// itself."
    EqSelf(u32),
    /// Argument at index `u32`, read as an `i128`, must fall within
    /// `[min, max]` inclusive.
    Range(u32, i128, i128),
}

/// Allowed conditions for a single function of a target contract. A function
/// with no conditions is allowed unconditionally once its name matches.
#[contracttype]
#[derive(Clone, Debug)]
pub struct FnRule {
    pub name: Symbol,
    pub conds: Vec<Cond>,
}

/// A target contract and the functions on it that this rule may call.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Target {
    pub contract: Address,
    pub fns: Vec<FnRule>,
}

/// The full configuration installed for one (account, context rule) pair.
/// Deny-by-default: any contract, function, or argument not covered by
/// `targets` is rejected.
#[contracttype]
#[derive(Clone, Debug)]
pub struct RolesConfig {
    pub mode: Mode,
    pub targets: Vec<Target>,
}
