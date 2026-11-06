/**
 * Pure evaluation logic for the "Try to move the chest" demo (spec
 * section 8). No network, no wallet — mirrors the policy contract's
 * semantics (route to a rule, count signers, check the policy, compare to
 * the threshold, deny on first failure) over a fixed, hardcoded example.
 */

export type RuleId = "EXIT" | "ENTRY" | "ADMIN";
export type ActionId = "exit-to-treasury" | "exit-outside" | "enter" | "approve" | "change-rules";
export type KeyId = "O1" | "O2" | "A1" | "A2" | "A3" | "G1" | "G2" | "G3";

export const ALL_KEYS: KeyId[] = ["O1", "O2", "A1", "A2", "A3", "G1", "G2", "G3"];

export const KEY_INFO: Record<KeyId, { label: string; group: "operator" | "approver" | "governance" }> = {
  O1: { label: "Operator 1", group: "operator" },
  O2: { label: "Operator 2", group: "operator" },
  A1: { label: "Approver 1", group: "approver" },
  A2: { label: "Approver 2", group: "approver" },
  A3: { label: "Approver 3", group: "approver" },
  G1: { label: "Governance 1", group: "governance" },
  G2: { label: "Governance 2", group: "governance" },
  G3: { label: "Governance 3", group: "governance" },
};

export interface RuleDef {
  id: RuleId;
  signers: KeyId[];
  threshold: number;
  allows: string;
}

export const RULES: Record<RuleId, RuleDef> = {
  EXIT: {
    id: "EXIT",
    signers: ["O1", "O2"],
    threshold: 1,
    allows: "withdraw on the example protocol, only if the destination is the chest",
  },
  ENTRY: {
    id: "ENTRY",
    signers: ["O1", "O2", "A1", "A2", "A3"],
    threshold: 3,
    allows: "deposit on the example protocol, plus the token transfer and approve calls it needs",
  },
  ADMIN: {
    id: "ADMIN",
    signers: ["G1", "G2", "G3"],
    threshold: 2,
    allows: "adding or removing rules and installing policies",
  },
};

/** The classic-multisig toggle (section 8.1): one threshold, any key, and
 * it never inspects the call's destination or arguments. */
export const CLASSIC_THRESHOLD = 2;

export interface ActionDef {
  id: ActionId;
  label: string;
  rule: RuleId;
  /** Whether this exact call satisfies the policy's argument conditions. */
  satisfiesPolicy: boolean;
  callDescription: string;
  denyReason: string;
}

export const ACTIONS: Record<ActionId, ActionDef> = {
  "exit-to-treasury": {
    id: "exit-to-treasury",
    label: "Exit the position to the chest",
    rule: "EXIT",
    satisfiesPolicy: true,
    callDescription: "withdraw() with destination = the chest",
    denyReason: "",
  },
  "exit-outside": {
    id: "exit-outside",
    label: "Exit the position to an outside address",
    rule: "EXIT",
    satisfiesPolicy: false,
    callDescription: "withdraw() with destination = an address outside the chest",
    denyReason:
      "The exit rule only allows the chest as destination, even though the signature is valid.",
  },
  enter: {
    id: "enter",
    label: "Enter the position",
    rule: "ENTRY",
    satisfiesPolicy: true,
    callDescription: "deposit() on the example protocol",
    denyReason: "",
  },
  approve: {
    id: "approve",
    label: "Approve token spending",
    rule: "ENTRY",
    satisfiesPolicy: true,
    callDescription: "approve() for the example protocol",
    denyReason: "",
  },
  "change-rules": {
    id: "change-rules",
    label: "Change the rules",
    rule: "ADMIN",
    satisfiesPolicy: true,
    callDescription: "add/remove a context rule or policy",
    denyReason: "",
  },
};

export interface EvaluationStep {
  label: string;
  passed: boolean;
  detail: string;
}

export interface EvaluationResult {
  approved: boolean;
  ruleId: RuleId;
  counted: number;
  required: number;
  ignoredKeys: KeyId[];
  reason: string;
  steps: EvaluationStep[];
}

export function evaluate(
  signedKeys: KeyId[],
  actionId: ActionId,
  classicMultisig: boolean,
): EvaluationResult {
  const action = ACTIONS[actionId];
  const rule = RULES[action.rule];
  const steps: EvaluationStep[] = [];

  // Step 1: choose the rule from the action.
  steps.push({
    label: `Route "${action.label}" to the ${rule.id} rule`,
    passed: true,
    detail: classicMultisig
      ? `Classic multisig ignores rule routing: any ${CLASSIC_THRESHOLD} of the account's keys can authorize any action.`
      : `${rule.id} allows ${rule.allows}.`,
  });

  // Step 2: count signed keys that belong to the rule's signer set. Classic
  // multisig doesn't scope by rule, so every key is eligible.
  const eligible = classicMultisig ? ALL_KEYS : rule.signers;
  const counted = signedKeys.filter((k) => eligible.includes(k)).length;
  const ignoredKeys = signedKeys.filter((k) => !eligible.includes(k));
  steps.push({
    label: "Count the signed keys that belong to this rule",
    passed: true,
    detail:
      ignoredKeys.length > 0
        ? `${counted} counted; ${ignoredKeys.join(", ")} ignored (not in this rule's signer set).`
        : `${counted} counted.`,
  });

  // Step 3: check the policy (function + argument conditions). Classic
  // multisig has no policy step — it never inspects the call.
  const policyOk = classicMultisig ? true : action.satisfiesPolicy;
  steps.push({
    label: "Check the policy: function and argument conditions",
    passed: policyOk,
    detail: classicMultisig
      ? "Classic multisig does not inspect the call's destination or arguments."
      : policyOk
        ? `${action.callDescription} — on the list, conditions hold.`
        : `${action.callDescription} — denied: ${action.denyReason}`,
  });
  if (!policyOk) {
    return {
      approved: false,
      ruleId: rule.id,
      counted,
      required: classicMultisig ? CLASSIC_THRESHOLD : rule.threshold,
      ignoredKeys,
      reason: action.denyReason,
      steps,
    };
  }

  // Step 4: compare signatures counted to the threshold required.
  const required = classicMultisig ? CLASSIC_THRESHOLD : rule.threshold;
  const thresholdOk = counted >= required;
  steps.push({
    label: "Compare signatures counted to the threshold required",
    passed: thresholdOk,
    detail: `${counted} of ${required} required.`,
  });

  if (!thresholdOk) {
    return {
      approved: false,
      ruleId: rule.id,
      counted,
      required,
      ignoredKeys,
      reason:
        ignoredKeys.length > 0
          ? `Only ${eligible === ALL_KEYS ? "keys counted toward the threshold" : `${rule.id.toLowerCase()} keys`} count for ${rule.id}; ${counted} of ${required}.`
          : `${rule.id} needs ${required} signature${required === 1 ? "" : "s"}; ${counted} counted.`,
      steps,
    };
  }

  return {
    approved: true,
    ruleId: rule.id,
    counted,
    required,
    ignoredKeys,
    reason: `${rule.id} rule, ${counted} of ${required}.`,
    steps,
  };
}
