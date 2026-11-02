// Mirrors crates/roles-config/src/lib.rs's hard limits exactly. Keep the two
// in sync — `lint` should reject a config the contract would reject anyway.
export const MAX_TARGETS_PER_RULE = 8;
export const MAX_FNS_PER_TARGET = 8;
export const MAX_CONDS_PER_FN = 4;

// From stellar-accounts 0.8.0 (crate constants MAX_SIGNERS / MAX_POLICIES).
export const MAX_SIGNERS_PER_CONTEXT_RULE = 15;
export const MAX_POLICIES_PER_CONTEXT_RULE = 5;
