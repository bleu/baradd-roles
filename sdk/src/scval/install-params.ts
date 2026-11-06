import type { xdr } from "@stellar/stellar-sdk";
import { ROLES_CONFIG_TYPE, rolesPolicySpec } from "./roles-policy-spec.js";
import { ruleConfigToNativeRolesConfig } from "./native.js";
import type { RuleConfig } from "../types.js";

/**
 * Encodes a rule's policy config as the raw `xdr.ScVal` that
 * `smart-account-kit`'s `PolicyManager.add`/`ContextRuleManager.add`
 * (`policies: Map<Address, ScVal>`) expect for a custom (non-typed) policy's
 * `install_params` — RolesPolicy isn't one of the kit's three example
 * policies, so there's no `createXParams` builder for it.
 */
export function installParamsToScVal(rule: RuleConfig): xdr.ScVal {
  const native = ruleConfigToNativeRolesConfig(rule);
  return rolesPolicySpec.nativeToScVal(native, ROLES_CONFIG_TYPE);
}
