//! Property tests for the evaluator. Run with `cargo test` without a network fork.
extern crate std;

use std::panic::{catch_unwind, AssertUnwindSafe};

use proptest::prelude::*;
use roles_config::{Cond, FnRule, Mode, RolesConfig, Target};
use soroban_sdk::{
    auth::{Context, ContractContext},
    testutils::Address as _,
    vec, Address, Env, IntoVal, String, Symbol,
};
use stellar_accounts::{
    policies::Policy,
    smart_account::{ContextRule, ContextRuleType},
};

use crate::RolesPolicyContract;

fn rule(e: &Env, contract: Address) -> ContextRule {
    ContextRule {
        id: 1,
        context_type: ContextRuleType::CallContract(contract),
        name: String::from_str(e, "r"),
        signers: soroban_sdk::Vec::new(e),
        signer_ids: soroban_sdk::Vec::new(e),
        policies: soroban_sdk::Vec::new(e),
        policy_ids: soroban_sdk::Vec::new(e),
        valid_until: None,
    }
}

/// Installs a one-target, one-function config with `conds`, then runs
/// `withdraw(arg0)` against it. Returns whether the call was allowed.
fn install_and_call(fn_name: &str, conds: std::vec::Vec<Cond>, arg0: i128) -> bool {
    let e = Env::default();
    e.mock_all_auths();
    let policy = e.register(RolesPolicyContract, ());
    let account = Address::generate(&e);
    let protocol = Address::generate(&e);

    let cfg = RolesConfig {
        mode: Mode::Entry,
        targets: vec![
            &e,
            Target {
                contract: protocol.clone(),
                fns: vec![
                    &e,
                    FnRule { name: Symbol::new(&e, "withdraw"), conds: soroban_sdk::Vec::from_slice(&e, &conds) },
                ],
            },
        ],
    };

    {
        let (policy, account, protocol) = (policy.clone(), account.clone(), protocol.clone());
        let r = rule(&e, protocol);
        e.as_contract(&policy, || {
            RolesPolicyContract::install(&e, cfg, r, account);
        });
    }

    let r = rule(&e, protocol.clone());
    let call_fn = Symbol::new(&e, fn_name);
    let args = vec![&e, arg0.into_val(&e)];
    let ctx = Context::Contract(ContractContext { contract: protocol, fn_name: call_fn, args });

    let result = catch_unwind(AssertUnwindSafe(|| {
        e.as_contract(&policy, || {
            RolesPolicyContract::enforce(&e, ctx, soroban_sdk::Vec::new(&e), r, account);
        });
    }));
    result.is_ok()
}

proptest! {
    /// A Range(0, min, max) condition allows arg0 iff min <= arg0 <= max,
    /// for arbitrary bounds and arbitrary call values — not just the
    /// hand-picked cases in src/test.rs.
    #[test]
    fn range_allows_iff_within_bounds(a: i128, b: i128, value: i128) {
        let (min, max) = if a <= b { (a, b) } else { (b, a) };
        let allowed = install_and_call("withdraw", std::vec![Cond::Range(0, min, max)], value);
        prop_assert_eq!(allowed, value >= min && value <= max);
    }

    /// Deny-by-default: a call to any function name other than the one
    /// listed is always rejected, regardless of its arguments or of how
    /// permissive that function's own conditions are.
    #[test]
    fn unlisted_function_name_is_always_denied(
        other_name in "[a-zA-Z][a-zA-Z0-9_]{0,8}",
        value: i128,
    ) {
        prop_assume!(other_name != "withdraw");
        let allowed = install_and_call(&other_name, std::vec![], value);
        prop_assert!(!allowed);
    }

    /// A function listed with no conditions allows any argument value —
    /// the flip side of the deny-by-default check above.
    #[test]
    fn unconditional_function_allows_any_value(value: i128) {
        let allowed = install_and_call("withdraw", std::vec![], value);
        prop_assert!(allowed);
    }
}
