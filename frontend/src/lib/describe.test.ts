import { describe, expect, it } from "vitest";
import { describeCond } from "./describe";
import type { Cond } from "./types";

describe("describeCond", () => {
  it("describes Eq against an address, shortened", () => {
    const cond: Cond = {
      kind: "Eq",
      arg: 1,
      value: { kind: "address", value: "CDEFINDEXVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    };
    expect(describeCond(cond)).toBe("arg[1] = CDEF…XXXX");
  });

  it("describes Eq against a symbol, quoted", () => {
    const cond: Cond = { kind: "Eq", arg: 0, value: { kind: "symbol", value: "withdraw" } };
    expect(describeCond(cond)).toBe('arg[0] = "withdraw"');
  });

  it("describes Eq against a plain number without quoting", () => {
    const cond: Cond = { kind: "Eq", arg: 2, value: { kind: "i128", value: "500000000000" } };
    expect(describeCond(cond)).toBe("arg[2] = 500000000000");
  });

  it("describes OneOf as a set", () => {
    const cond: Cond = {
      kind: "OneOf",
      arg: 0,
      values: [
        { kind: "address", value: "CAAAAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
        { kind: "address", value: "CBBBBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
      ],
    };
    expect(describeCond(cond)).toBe("arg[0] ∈ {CAAA…XXXX, CBBB…XXXX}");
  });

  it("describes EqSelf as a reference to the account", () => {
    const cond: Cond = { kind: "EqSelf", arg: 0 };
    expect(describeCond(cond)).toBe("arg[0] = this account");
  });

  it("describes Range with both bounds", () => {
    const cond: Cond = { kind: "Range", arg: 1, min: "0", max: "500000000000" };
    expect(describeCond(cond)).toBe("arg[1] ∈ [0, 500000000000]");
  });
});
