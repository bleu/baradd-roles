import { describe, expect, it } from "vitest";
import { shortAddr } from "./format";

describe("shortAddr", () => {
  it("truncates a long address to lead…tail", () => {
    expect(shortAddr("CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")).toBe("CTRE…XXXX");
  });

  it("respects custom lead/tail lengths", () => {
    expect(shortAddr("CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", 6, 6)).toBe(
      "CTREAS…XXXXXX",
    );
  });

  it("returns a short address unchanged rather than truncating it", () => {
    expect(shortAddr("SHORT")).toBe("SHORT");
  });

  it("returns the address unchanged right at the truncation boundary", () => {
    // length === lead + tail + 1 is the "too short to bother" case.
    const addr = "123456789"; // 9 chars, lead=4 + tail=4 + 1 = 9
    expect(shortAddr(addr)).toBe(addr);
  });
});
