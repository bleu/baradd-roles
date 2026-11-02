use roles_config::RolesConfig;
use soroban_sdk::{contracttype, panic_with_error, Address, Env};

use crate::RolesPolicyError;

const DAY_IN_LEDGERS: u32 = 17280;
pub const ROLES_POLICY_EXTEND_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub const ROLES_POLICY_TTL_THRESHOLD: u32 = ROLES_POLICY_EXTEND_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
enum DataKey {
    /// Configuration for a (smart_account, context_rule_id) pair. The same
    /// deployed policy contract instance serves every account and rule that
    /// installs it.
    Config(Address, u32),
}

pub fn has_config(e: &Env, smart_account: &Address, context_rule_id: u32) -> bool {
    e.storage()
        .persistent()
        .has(&DataKey::Config(smart_account.clone(), context_rule_id))
}

pub fn set_config(e: &Env, smart_account: &Address, context_rule_id: u32, cfg: &RolesConfig) {
    e.storage()
        .persistent()
        .set(&DataKey::Config(smart_account.clone(), context_rule_id), cfg);
}

pub fn get_config(e: &Env, smart_account: &Address, context_rule_id: u32) -> RolesConfig {
    let key = DataKey::Config(smart_account.clone(), context_rule_id);
    e.storage()
        .persistent()
        .get(&key)
        .inspect(|_| {
            e.storage().persistent().extend_ttl(
                &key,
                ROLES_POLICY_TTL_THRESHOLD,
                ROLES_POLICY_EXTEND_AMOUNT,
            );
        })
        .unwrap_or_else(|| panic_with_error!(e, RolesPolicyError::NotInstalled))
}

pub fn remove_config(e: &Env, smart_account: &Address, context_rule_id: u32) {
    let key = DataKey::Config(smart_account.clone(), context_rule_id);
    if !e.storage().persistent().has(&key) {
        panic_with_error!(e, RolesPolicyError::NotInstalled)
    }
    e.storage().persistent().remove(&key);
}
