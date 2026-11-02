extern crate std;

use roles_config::{Cond, CondValue, FnRule, Mode, RolesConfig, Target};
use soroban_sdk::{
    auth::{Context, ContractContext},
    testutils::{Address as _, Events as _},
    vec, Address, Env, IntoVal, String, Symbol, Val, Vec,
};
use stellar_accounts::{
    policies::Policy,
    smart_account::{ContextRule, ContextRuleType},
};

use crate::RolesPolicyContract;

fn rule(e: &Env, id: u32, contract: Address) -> ContextRule {
    ContextRule {
        id,
        context_type: ContextRuleType::CallContract(contract),
        name: String::from_str(e, "r"),
        signers: Vec::new(e),
        signer_ids: Vec::new(e),
        policies: Vec::new(e),
        policy_ids: Vec::new(e),
        valid_until: None,
    }
}

fn contract_ctx(contract: Address, fn_name: Symbol, args: Vec<Val>) -> Context {
    Context::Contract(ContractContext { contract, fn_name, args })
}

/// An exit config: one target, one function, "the withdrawal destination
/// must be the account itself".
fn exit_cfg(e: &Env, protocol: &Address) -> RolesConfig {
    RolesConfig {
        mode: Mode::Exit,
        targets: vec![
            e,
            Target {
                contract: protocol.clone(),
                fns: vec![e, FnRule { name: Symbol::new(e, "withdraw"), conds: vec![e, Cond::EqSelf(0)] }],
            },
        ],
    }
}

struct Harness {
    e: Env,
    policy: Address,
    account: Address,
    protocol: Address,
}

impl Harness {
    /// Each `Policy` method requires auth from `smart_account`. The mock-auth
    /// harness only tolerates one `require_auth` per synthetic root frame, so
    /// every auth-requiring call gets its own `as_contract` closure — mirrors
    /// how `stellar-accounts`' own policy tests are structured (see
    /// `policies::test::simple_threshold::enforce_success`).
    fn install(&self, cfg: RolesConfig, r: &ContextRule) {
        let (policy, account) = (self.policy.clone(), self.account.clone());
        let r = r.clone();
        self.e.as_contract(&policy, || {
            RolesPolicyContract::install(&self.e, cfg, r, account);
        });
    }

    fn enforce(&self, ctx: Context, r: &ContextRule) {
        let (policy, account) = (self.policy.clone(), self.account.clone());
        let r = r.clone();
        self.e.as_contract(&policy, || {
            RolesPolicyContract::enforce(&self.e, ctx, Vec::new(&self.e), r, account);
        });
    }

    fn uninstall(&self, r: &ContextRule) {
        let (policy, account) = (self.policy.clone(), self.account.clone());
        let r = r.clone();
        self.e.as_contract(&policy, || {
            RolesPolicyContract::uninstall(&self.e, r, account);
        });
    }

    fn get_config(&self, r: &ContextRule) -> RolesConfig {
        let (policy, account) = (self.policy.clone(), self.account.clone());
        self.e.as_contract(&policy, || RolesPolicyContract::get_config(&self.e, account, r.id))
    }

    fn has_config(&self, r: &ContextRule) -> bool {
        let policy = self.policy.clone();
        self.e.as_contract(&policy, || crate::storage::has_config(&self.e, &self.account, r.id))
    }
}

fn setup() -> Harness {
    let e = Env::default();
    e.mock_all_auths();
    let policy = e.register(RolesPolicyContract, ());
    let account = Address::generate(&e);
    let protocol = Address::generate(&e);
    Harness { e, policy, account, protocol }
}

#[test]
fn allows_a_listed_call_that_satisfies_its_conditions() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    let args = vec![&h.e, h.account.clone().into_val(&h.e)];
    let ctx = contract_ctx(h.protocol.clone(), Symbol::new(&h.e, "withdraw"), args);
    h.enforce(ctx, &r);

    let events = h.e.events().all().filter_by_contract(&h.policy);
    assert!(!events.events().is_empty());
}

#[test]
#[should_panic(expected = "Error(Contract, #4106)")]
fn denies_a_contract_outside_the_target_list() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    let other = Address::generate(&h.e);
    let args = vec![&h.e, h.account.clone().into_val(&h.e)];
    let ctx = contract_ctx(other, Symbol::new(&h.e, "withdraw"), args);
    h.enforce(ctx, &r);
}

#[test]
#[should_panic(expected = "Error(Contract, #4107)")]
fn denies_a_function_not_listed_for_the_contract() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    // "deposit" is an entry-shaped call, not in this exit config.
    let args = vec![&h.e, h.account.clone().into_val(&h.e)];
    let ctx = contract_ctx(h.protocol.clone(), Symbol::new(&h.e, "deposit"), args);
    h.enforce(ctx, &r);
}

#[test]
#[should_panic(expected = "Error(Contract, #4108)")]
fn denies_a_call_whose_destination_is_not_the_account_itself() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    // A forced exit to someone else's address must still be denied, even
    // with a correct contract and function.
    let attacker = Address::generate(&h.e);
    let args = vec![&h.e, attacker.into_val(&h.e)];
    let ctx = contract_ctx(h.protocol.clone(), Symbol::new(&h.e, "withdraw"), args);
    h.enforce(ctx, &r);
}

#[test]
fn one_of_and_range_conditions() {
    let h = setup();
    let allowed_a = Address::generate(&h.e);
    let allowed_b = Address::generate(&h.e);
    let cfg = RolesConfig {
        mode: Mode::Entry,
        targets: vec![
            &h.e,
            Target {
                contract: h.protocol.clone(),
                fns: vec![
                    &h.e,
                    FnRule {
                        name: Symbol::new(&h.e, "deposit"),
                        conds: vec![
                            &h.e,
                            Cond::OneOf(
                                0,
                                vec![
                                    &h.e,
                                    CondValue::Address(allowed_a.clone()),
                                    CondValue::Address(allowed_b.clone()),
                                ],
                            ),
                            Cond::Range(1, 1, 1_000_000),
                        ],
                    },
                ],
            },
        ],
    };
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    let args = vec![&h.e, allowed_b.into_val(&h.e), 500_i128.into_val(&h.e)];
    let ctx = contract_ctx(h.protocol.clone(), Symbol::new(&h.e, "deposit"), args);
    h.enforce(ctx, &r);
}

#[test]
#[should_panic(expected = "Error(Contract, #4108)")]
fn range_condition_rejects_an_out_of_bounds_amount() {
    let h = setup();
    let cfg = RolesConfig {
        mode: Mode::Entry,
        targets: vec![
            &h.e,
            Target {
                contract: h.protocol.clone(),
                fns: vec![
                    &h.e,
                    FnRule { name: Symbol::new(&h.e, "deposit"), conds: vec![&h.e, Cond::Range(0, 1, 100)] },
                ],
            },
        ],
    };
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    let args = vec![&h.e, 999_i128.into_val(&h.e)];
    let ctx = contract_ctx(h.protocol.clone(), Symbol::new(&h.e, "deposit"), args);
    h.enforce(ctx, &r);
}

#[test]
#[should_panic(expected = "Error(Contract, #4105)")]
fn denies_a_non_contract_call_context() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);

    let ctx = Context::CreateContractHostFn(soroban_sdk::auth::CreateContractHostFnContext {
        executable: soroban_sdk::auth::ContractExecutable::Wasm(soroban_sdk::BytesN::from_array(&h.e, &[0u8; 32])),
        salt: soroban_sdk::BytesN::from_array(&h.e, &[0u8; 32]),
    });
    h.enforce(ctx, &r);
}

#[test]
#[should_panic(expected = "Error(Contract, #4101)")]
fn install_twice_for_the_same_account_and_rule_is_rejected() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg.clone(), &r);
    h.install(cfg, &r);
}

#[test]
#[should_panic(expected = "Error(Contract, #4100)")]
fn enforce_without_install_is_rejected() {
    let h = setup();
    let r = rule(&h.e, 1, h.protocol.clone());
    let args = vec![&h.e, h.account.clone().into_val(&h.e)];
    let ctx = contract_ctx(h.protocol.clone(), Symbol::new(&h.e, "withdraw"), args);
    h.enforce(ctx, &r);
}

#[test]
fn uninstall_removes_the_configuration() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 1, h.protocol.clone());
    h.install(cfg, &r);
    h.uninstall(&r);
    assert!(!h.has_config(&r));
}

#[test]
fn get_config_round_trips_what_was_installed() {
    let h = setup();
    let cfg = exit_cfg(&h.e, &h.protocol);
    let r = rule(&h.e, 7, h.protocol.clone());
    h.install(cfg.clone(), &r);

    let got = h.get_config(&r);
    assert_eq!(got.mode, cfg.mode);
    assert_eq!(got.targets.len(), cfg.targets.len());
}
