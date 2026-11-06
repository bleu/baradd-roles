export * from "./apply.js";
// Re-exported for backward compatibility — the actual encoding logic lives
// in ../scval/ now (it has no smart-account-kit dependency; this module
// does, via apply.js).
export * from "../scval/install-params.js";
export { ruleConfigToNativeRolesConfig } from "../scval/native.js";
