/**
 * Pure evaluation logic for the "Try to move the chest" demo (spec
 * section 8). No network, no wallet — mirrors the real account's semantics:
 * route to a rule, check the argument conditions, then check whether ANY
 * ONE of the rule's independent role groups has reached its own threshold
 * (groups are never pooled together). Over a fixed, hardcoded example.
 */

export type Role = "governance" | "admin" | "operator";
export type KeyId = "G1" | "G2" | "A1" | "A2" | "A3" | "O1" | "O2" | "O3";
export type ActionId = "exit" | "exit-outside" | "enter" | "approve" | "change-rules";

export const ROLE_LABEL: Record<Role, string> = {
  governance: "Governance",
  admin: "Admin",
  operator: "Operator",
};

export const ROLE_KEYS: Record<Role, KeyId[]> = {
  governance: ["G1", "G2"],
  admin: ["A1", "A2", "A3"],
  operator: ["O1", "O2", "O3"],
};

export const ALL_KEYS: KeyId[] = [...ROLE_KEYS.governance, ...ROLE_KEYS.admin, ...ROLE_KEYS.operator];

export const KEY_INFO: Record<KeyId, { label: string; role: Role }> = Object.fromEntries(
  (Object.keys(ROLE_KEYS) as Role[]).flatMap((role) =>
    ROLE_KEYS[role].map((key, i) => [key, { label: `${ROLE_LABEL[role]} ${i + 1}`, role }]),
  ),
) as Record<KeyId, { label: string; role: Role }>;

interface GroupRequirement {
  role: Role;
  need: number;
}

interface ActionDef {
  id: ActionId;
  label: string;
  fnName: string;
  fnCall: string;
  satisfiesPolicy: boolean;
  argText: string;
  groups: GroupRequirement[];
}

const EXIT_GROUPS: GroupRequirement[] = [
  { role: "operator", need: 1 },
  { role: "admin", need: 1 },
];

export const ACTIONS: Record<ActionId, ActionDef> = {
  exit: {
    id: "exit",
    label: "Exit to the chest",
    fnName: "withdraw",
    fnCall: "withdraw(…, this account)",
    satisfiesPolicy: true,
    argText: "Destination equals this chest. Passed.",
    groups: EXIT_GROUPS,
  },
  "exit-outside": {
    id: "exit-outside",
    label: "Exit to an outside address",
    fnName: "withdraw",
    fnCall: "withdraw(…, other account)",
    satisfiesPolicy: false,
    argText: "Destination is not this chest. Failed.",
    groups: EXIT_GROUPS,
  },
  enter: {
    id: "enter",
    label: "Enter a new position",
    fnName: "deposit",
    fnCall: "deposit(…, amount)",
    satisfiesPolicy: true,
    argText: "Amount is within the allowed range. Passed.",
    groups: [
      { role: "admin", need: 2 },
      { role: "governance", need: 2 },
    ],
  },
  approve: {
    id: "approve",
    label: "Approve token spending",
    fnName: "approve",
    fnCall: "approve(spender, …)",
    satisfiesPolicy: true,
    argText: "Spender is in the approved set. Passed.",
    groups: [
      { role: "admin", need: 3 },
      { role: "governance", need: 2 },
    ],
  },
  "change-rules": {
    id: "change-rules",
    label: "Change the rules",
    fnName: "set_rule",
    fnCall: "set_rule(…)",
    satisfiesPolicy: true,
    argText: "No argument limits on this rule.",
    groups: [{ role: "governance", need: 2 }],
  },
};

/** The classic-multisig toggle (section 8.1): one pooled threshold, any
 * key, and it never inspects the call's destination or arguments. */
export const CLASSIC_THRESHOLD = 5;

export interface EvaluationStep {
  title: string;
  detail: string;
  tone: "ok" | "bad" | "info" | "neutral";
  mark: string;
  pins?: KeyId[];
}

export interface EvaluationResult {
  approved: boolean;
  headline: string;
  steps: EvaluationStep[];
}

export function evaluate(signedKeys: KeyId[], actionId: ActionId, classicMultisig: boolean): EvaluationResult {
  const action = ACTIONS[actionId];
  const signed = new Set(signedKeys);
  const steps: EvaluationStep[] = [];

  if (classicMultisig) {
    const total = signedKeys.length;
    const approved = total >= CLASSIC_THRESHOLD;
    steps.push({
      title: "Rule matched",
      detail: "None. A classic multisig has one rule for every action, including this one.",
      tone: "neutral",
      mark: "–",
    });
    steps.push({
      title: "Argument check",
      detail: "Not performed. It cannot tell a safe destination from an unsafe one.",
      tone: "neutral",
      mark: "–",
    });
    steps.push({
      title: "Signatures counted",
      detail: `${total} of ${ALL_KEYS.length} keys signed. ${CLASSIC_THRESHOLD} needed.`,
      tone: approved ? "ok" : "bad",
      mark: approved ? "✓" : "✕",
    });
    return {
      approved,
      headline: approved
        ? `Approved. ${CLASSIC_THRESHOLD} keys signed.`
        : `Denied. Classic multisig needs ${CLASSIC_THRESHOLD} of ${ALL_KEYS.length}, and ${total} signed.`,
      steps,
    };
  }

  const results = action.groups.map((g) => {
    const have = ROLE_KEYS[g.role].filter((k) => signed.has(k)).length;
    return { ...g, have, met: have >= g.need };
  });
  const anyMet = results.some((r) => r.met);
  const approved = action.satisfiesPolicy && anyMet;

  let headline: string;
  if (!action.satisfiesPolicy) headline = "Denied. The argument check failed, so signatures do not matter.";
  else if (anyMet) headline = `Approved. ${ROLE_LABEL[results.find((r) => r.met)!.role]} reached its threshold.`;
  else headline = "Denied. No group has enough signatures yet.";

  steps.push({
    title: "Rule matched",
    detail: `${action.label} → ${action.fnName}()`,
    tone: "info",
    mark: "1",
  });
  steps.push({
    title: "Argument check",
    detail: action.argText,
    tone: action.satisfiesPolicy ? "ok" : "bad",
    mark: action.satisfiesPolicy ? "✓" : "✕",
  });
  results.forEach((r, i) => {
    steps.push({
      title: `${i === 0 ? "" : "Or: "}${ROLE_LABEL[r.role]} group, ${r.need} of ${ROLE_KEYS[r.role].length} needed`,
      detail: `${r.have} signed${r.met ? ". Threshold reached." : ". Not enough."}`,
      tone: r.met ? "ok" : "neutral",
      mark: r.met ? "✓" : "·",
      pins: ROLE_KEYS[r.role],
    });
  });
  steps.push({
    title: "Any one group is enough",
    detail: approved
      ? "At least one group passed and the arguments are valid."
      : "Both conditions must hold: valid arguments and one group at threshold.",
    tone: approved ? "ok" : "bad",
    mark: approved ? "✓" : "✕",
  });

  return { approved, headline, steps };
}
