import { describe, expect, it } from "vitest";
import { evaluate, type ActionId, type KeyId } from "./evaluate";

// Required counts are rule thresholds, not the total number of eligible signers.
describe("evaluate — required demo cases", () => {
  const cases: Array<{
    n: number;
    signed: KeyId[];
    action: ActionId;
    approved: boolean;
    rule: string;
    counted: number;
    required: number;
  }> = [
    { n: 1, signed: ["O1"], action: "exit-to-treasury", approved: true, rule: "EXIT", counted: 1, required: 1 },
    { n: 2, signed: ["O1"], action: "exit-outside", approved: false, rule: "EXIT", counted: 1, required: 1 },
    { n: 3, signed: ["O1"], action: "enter", approved: false, rule: "ENTRY", counted: 1, required: 3 },
    { n: 4, signed: ["O1", "A1", "A2"], action: "enter", approved: true, rule: "ENTRY", counted: 3, required: 3 },
    { n: 5, signed: ["O1"], action: "approve", approved: false, rule: "ENTRY", counted: 1, required: 3 },
    { n: 6, signed: ["O1"], action: "change-rules", approved: false, rule: "ADMIN", counted: 0, required: 2 },
    { n: 7, signed: ["G1", "G2"], action: "change-rules", approved: true, rule: "ADMIN", counted: 2, required: 2 },
    { n: 8, signed: ["A1"], action: "exit-to-treasury", approved: false, rule: "EXIT", counted: 0, required: 1 },
  ];

  for (const c of cases) {
    it(`case ${c.n}: ${c.signed.join("+")} on "${c.action}" → ${c.approved ? "approved" : "denied"}`, () => {
      const result = evaluate(c.signed, c.action, false);
      expect(result.approved).toBe(c.approved);
      expect(result.ruleId).toBe(c.rule);
      expect(result.counted).toBe(c.counted);
      expect(result.required).toBe(c.required);
    });
  }

  it("case 2 denies for a policy reason, not a threshold reason, even though the signature is valid", () => {
    const result = evaluate(["O1"], "exit-outside", false);
    expect(result.steps[2].passed).toBe(false); // the policy-check step
    expect(result.reason).toContain("chest as destination");
  });

  it("case 8 shows A1 as ignored, not merely under-threshold", () => {
    const result = evaluate(["A1"], "exit-to-treasury", false);
    expect(result.ignoredKeys).toEqual(["A1"]);
  });
});

describe("evaluate — classic multisig toggle", () => {
  it("case 1 and case 3 both need 2 signatures in classic mode", () => {
    const exit = evaluate(["O1"], "exit-to-treasury", true);
    const enter = evaluate(["O1"], "enter", true);
    expect(exit.required).toBe(2);
    expect(enter.required).toBe(2);
    expect(exit.approved).toBe(false);
    expect(enter.approved).toBe(false);
  });

  it("case 2 is approved with 2 keys in classic mode, because destination isn't checked", () => {
    const result = evaluate(["O1", "O2"], "exit-outside", true);
    expect(result.approved).toBe(true);
  });
});
