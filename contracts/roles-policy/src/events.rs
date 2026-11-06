use roles_config::Mode;
use soroban_sdk::{contractevent, Address, Symbol};

/// Emitted on install. Omits the full configuration to keep the event small.
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
