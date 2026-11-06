import type { xdr } from "@stellar/stellar-sdk";
import { accountSpec, CONTEXT_RULE_TYPE } from "./account-spec";

/** Decodes add_context_rule's return value (the new ContextRule) down to just its assigned id. */
export function decodeNewRuleId(returnValue: xdr.ScVal | undefined): number {
  if (!returnValue) throw new Error("add_context_rule returned no value — could not determine the new rule's id.");
  const native = accountSpec.scValToNative(returnValue, CONTEXT_RULE_TYPE) as { id: number };
  return native.id;
}
