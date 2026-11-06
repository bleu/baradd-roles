import { describe, expect, it } from "vitest";
import { evaluate, type ActionId, type KeyId } from "./evaluate";

// Mirrors the demo's real signer shape: 2 governance, 3 admin, 3 operator
// keys, and independent OR'd role groups per action — the same model the
// rest of the app (role-groups-editor, the on-chain wizard) uses, not a
// pooled per-rule threshold.
describe("evaluate — independent role groups", () => {
  const cases: Array<{ n: number; signed: KeyId[]; action: ActionId; approved: boolean }> = [
    { n: 1, signed: ["O1"], action: "exit", approved: true }, // operator 1 of 1
    { n: 2, signed: ["O1"], action: "exit-outside", approved: false }, // policy denies regardless of signatures
    { n: 3, signed: ["O1"], action: "enter", approved: false }, // operator isn't an "enter" group
    { n: 4, signed: ["A1", "A2"], action: "enter", approved: true }, // admin 2 of 2
    { n: 5, signed: ["G1", "G2"], action: "enter", approved: true }, // governance 2 of 2, the other path
    { n: 6, signed: ["A1", "A2", "A3"], action: "approve", approved: true }, // admin 3 of 3
    { n: 7, signed: ["G1"], action: "change-rules", approved: false }, // governance 1 of 2, not enough
    { n: 8, signed: ["G1", "G2"], action: "change-rules", approved: true }, // governance 2 of 2
    { n: 9, signed: ["A1"], action: "change-rules", approved: false }, // admin isn't a "change-rules" group at all
  ];

  for (const c of cases) {
    it(`case ${c.n}: ${c.signed.join("+")} on "${c.action}" → ${c.approved ? "approved" : "denied"}`, () => {
      expect(evaluate(c.signed, c.action, false).approved).toBe(c.approved);
    });
  }

  it("denies for a policy reason, not a threshold reason, even with a valid signer", () => {
    const result = evaluate(["O1"], "exit-outside", false);
    expect(result.steps[1].tone).toBe("bad"); // the argument-check step
    expect(result.headline).toContain("argument check failed");
  });

  it("names the group that satisfied the threshold when more than one path exists", () => {
    const result = evaluate(["G1", "G2"], "enter", false);
    expect(result.headline).toContain("Governance");
  });
});

describe("evaluate — classic multisig toggle", () => {
  it("needs 5 of 8 keys regardless of role or action", () => {
    const under = evaluate(["O1", "O2", "A1", "A2"], "exit", true);
    const atThreshold = evaluate(["O1", "O2", "A1", "A2", "A3"], "exit", true);
    expect(under.approved).toBe(false);
    expect(atThreshold.approved).toBe(true);
  });

  it("approves an outside exit with 5 keys, because destination isn't checked", () => {
    const result = evaluate(["O1", "O2", "A1", "A2", "A3"], "exit-outside", true);
    expect(result.approved).toBe(true);
  });
});
