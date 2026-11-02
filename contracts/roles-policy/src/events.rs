use roles_config::Mode;
use soroban_sdk::{contractevent, Address, Symbol};

/// Emitted on install. Carries the mode and target count, not the full
/// configuration, so configuration changes stay auditable off-chain without
/// risking the transaction-size limit the spec flags (see docs/spec.md,
/// "Storage, limits and costs").
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RolesInstalled {
    #[topic]
    pub smart_account: Address,
    #[topic]
    pub context_rule_id: u32,
    pub mode: Mode,
    pub targets_count: u32,
}

/// Emitted on every successful `enforce`. Deliberately omits the call's
/// arguments.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RolesEnforced {
    #[topic]
    pub smart_account: Address,
    #[topic]
    pub context_rule_id: u32,
    pub contract: Address,
    pub fn_name: Symbol,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RolesUninstalled {
    #[topic]
    pub smart_account: Address,
    #[topic]
    pub context_rule_id: u32,
}
