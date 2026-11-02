//! `RolesPolicy`: a [`Policy`] for OpenZeppelin's Stellar smart accounts that
//! scopes authorization by contract, function, and argument, deny-by-default.
//!
//! Pair one instance of this policy with an EXIT context rule (1-signature
//! threshold, a target list of exit-only functions) and another with an ENTRY
//! context rule (M-signature threshold, a target list that also allows the
//! token `transfer`/`approve` calls entering requires). See
//! `docs/spec.md` for the full design and threat model.
#![no_std]

mod eval;
mod events;
mod storage;

use roles_config::{RolesConfig, MAX_CONDS_PER_FN, MAX_FNS_PER_TARGET, MAX_TARGETS_PER_RULE};
use soroban_sdk::{auth::Context, contract, contracterror, contractimpl, panic_with_error, Address, Env, Vec};
use stellar_accounts::{
    policies::Policy,
    smart_account::{ContextRule, Signer},
};

use events::{RolesInstalled, RolesUninstalled};

#[contract]
pub struct RolesPolicyContract;

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq)]
#[repr(u32)]
pub enum RolesPolicyError {
    /// No `RolesConfig` is installed for this (account, context rule).
    NotInstalled = 4100,
    /// A `RolesConfig` is already installed for this (account, context rule).
    AlreadyInstalled = 4101,
    /// `targets` exceeds [`MAX_TARGETS_PER_RULE`].
    TooManyTargets = 4102,
    /// A target's `fns` exceeds [`MAX_FNS_PER_TARGET`].
    TooManyFunctions = 4103,
    /// A function's `conds` exceeds [`MAX_CONDS_PER_FN`].
    TooManyConditions = 4104,
    /// The authorization context is not a plain contract call (for example a
    /// contract-creation context). This policy only ever authorizes
    /// `Context::Contract`.
    NotAContractCall = 4105,
    /// The called contract is not in the installed target list.
    ContractNotAllowed = 4106,
    /// The called function is not listed for the target contract.
    FunctionNotAllowed = 4107,
    /// One of the function's conditions evaluated to false.
    ConditionFailed = 4108,
}

fn validate_limits(e: &Env, cfg: &RolesConfig) {
    if cfg.targets.len() > MAX_TARGETS_PER_RULE {
        panic_with_error!(e, RolesPolicyError::TooManyTargets)
    }
    for target in cfg.targets.iter() {
        if target.fns.len() > MAX_FNS_PER_TARGET {
            panic_with_error!(e, RolesPolicyError::TooManyFunctions)
        }
        for fn_rule in target.fns.iter() {
            if fn_rule.conds.len() > MAX_CONDS_PER_FN {
                panic_with_error!(e, RolesPolicyError::TooManyConditions)
            }
        }
    }
}

#[contractimpl]
impl Policy for RolesPolicyContract {
    type AccountParams = RolesConfig;

    fn install(e: &Env, install_params: RolesConfig, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();

        if storage::has_config(e, &smart_account, context_rule.id) {
            panic_with_error!(e, RolesPolicyError::AlreadyInstalled)
        }
        validate_limits(e, &install_params);

        let mode = install_params.mode.clone();
        let targets_count = install_params.targets.len();
        storage::set_config(e, &smart_account, context_rule.id, &install_params);

        RolesInstalled {
            smart_account,
            context_rule_id: context_rule.id,
            mode,
            targets_count,
        }
        .publish(e);
    }

    fn enforce(
        e: &Env,
        context: Context,
        _authenticated_signers: Vec<Signer>,
        context_rule: ContextRule,
        smart_account: Address,
    ) {
        smart_account.require_auth();
        let cfg = storage::get_config(e, &smart_account, context_rule.id);
        eval::enforce(e, &context, &cfg, context_rule.id, &smart_account);
    }

    fn uninstall(e: &Env, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        storage::remove_config(e, &smart_account, context_rule.id);

        RolesUninstalled { smart_account, context_rule_id: context_rule.id }.publish(e);
    }
}

#[contractimpl]
impl RolesPolicyContract {
    /// Read-only query, for the CLI/SDK and for approvers reviewing a
    /// proposed installation. Not part of the `Policy` trait.
    pub fn get_config(e: &Env, smart_account: Address, context_rule_id: u32) -> RolesConfig {
        storage::get_config(e, &smart_account, context_rule_id)
    }
}

#[cfg(test)]
mod test;
#[cfg(test)]
mod property_test;
