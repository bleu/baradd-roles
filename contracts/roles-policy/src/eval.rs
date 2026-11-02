use roles_config::{Cond, CondValue, RolesConfig};
use soroban_sdk::{
    auth::{Context, ContractContext},
    panic_with_error, Address, Env, Symbol, TryFromVal, Val, Vec,
};

use crate::{events::RolesEnforced, RolesPolicyError};

/// Evaluates `context` against `cfg`, following the six steps in
/// docs/spec.md ("Evaluation (`enforce`)"). Panics (denies) on the first
/// failing step.
pub fn enforce(e: &Env, context: &Context, cfg: &RolesConfig, context_rule_id: u32, smart_account: &Address) {
    // Step 2: deny anything that isn't a plain contract call. This policy
    // should only ever be attached to a `CallContract` rule, but a defensive
    // check here means a misconfigured `Default`/`CreateContract` rule still
    // fails closed rather than silently allowing deployments.
    let ContractContext { contract, fn_name, args } = match context {
        Context::Contract(c) => c,
        _ => panic_with_error!(e, RolesPolicyError::NotAContractCall),
    };

    // Step 3: the contract must be in the target list.
    let target = cfg
        .targets
        .iter()
        .find(|t| &t.contract == contract)
        .unwrap_or_else(|| panic_with_error!(e, RolesPolicyError::ContractNotAllowed));

    // Step 4: the function must be listed for that contract.
    let fn_rule = target
        .fns
        .iter()
        .find(|f| &f.name == fn_name)
        .unwrap_or_else(|| panic_with_error!(e, RolesPolicyError::FunctionNotAllowed));

    // Step 5: every condition on the function's arguments must hold.
    for cond in fn_rule.conds.iter() {
        if !eval_cond(e, &cond, args, smart_account) {
            panic_with_error!(e, RolesPolicyError::ConditionFailed)
        }
    }

    // Step 6: compact event, no arguments.
    RolesEnforced {
        smart_account: smart_account.clone(),
        context_rule_id,
        contract: contract.clone(),
        fn_name: fn_name.clone(),
    }
    .publish(e);
}

fn eval_cond(e: &Env, cond: &Cond, args: &Vec<Val>, smart_account: &Address) -> bool {
    match cond {
        Cond::Eq(idx, expected) => match args.get(*idx) {
            Some(arg) => cond_value_matches(e, &arg, expected),
            None => false,
        },
        Cond::OneOf(idx, expected_set) => match args.get(*idx) {
            Some(arg) => expected_set.iter().any(|expected| cond_value_matches(e, &arg, &expected)),
            None => false,
        },
        Cond::EqSelf(idx) => match args.get(*idx) {
            Some(arg) => matches!(Address::try_from_val(e, &arg), Ok(addr) if &addr == smart_account),
            None => false,
        },
        Cond::Range(idx, min, max) => match args.get(*idx) {
            Some(arg) => matches!(i128::try_from_val(e, &arg), Ok(n) if n >= *min && n <= *max),
            None => false,
        },
    }
}

fn cond_value_matches(e: &Env, arg: &Val, expected: &CondValue) -> bool {
    match expected {
        CondValue::U32(v) => matches!(u32::try_from_val(e, arg), Ok(x) if x == *v),
        CondValue::I128(v) => matches!(i128::try_from_val(e, arg), Ok(x) if x == *v),
        CondValue::Address(v) => matches!(Address::try_from_val(e, arg), Ok(x) if &x == v),
        CondValue::Symbol(v) => matches!(Symbol::try_from_val(e, arg), Ok(x) if &x == v),
    }
}
