import { describe, expect, it } from "vitest";
import { diffConfigs } from "./diff.js";
import type { ConfigFile, FnRule } from "./types.js";

function cfg(rule: ConfigFile["rule"][number]): ConfigFile {
  return { account: { address: "CTREASURYACCOUNT" }, rule: [rule] };
}

const entry = {
  name: "entry-defindex",
  mode: "entry" as const,
  threshold: 2,
  signers: ["GOP1", "GAP1"],
  target: [
    {
      contract: "CDEFINDEX",
      fn: [{ name: "deposit", cond: [{ op: "range" as const, arg: 1, min: "0", max: "1000" }] }],
    },
  ],
};

describe("diffConfigs", () => {
  it("has no entries for identical configs", () => {
    expect(diffConfigs(cfg(entry), cfg(entry))).toEqual([]);
  });

  it("flags a lowered threshold as widening", () => {
    const after = { ...entry, threshold: 1 };
    const diff = diffConfigs(cfg(entry), cfg(after));
    expect(diff).toContainEqual(expect.objectContaining({ direction: "widening" }));
  });

  it("flags a raised threshold as narrowing", () => {
    const after = { ...entry, threshold: 3 };
    const diff = diffConfigs(cfg(entry), cfg(after));
    expect(diff).toContainEqual(expect.objectContaining({ direction: "narrowing" }));
  });

  it("flags a widened range as widening", () => {
    const after = {
      ...entry,
      target: [
        {
          contract: "CDEFINDEX",
          fn: [{ name: "deposit", cond: [{ op: "range" as const, arg: 1, min: "0", max: "1000000" }] }],
        },
      ],
    };
    const diff = diffConfigs(cfg(entry), cfg(after));
    expect(diff).toContainEqual(expect.objectContaining({ direction: "widening" }));
  });

  it("flags a new target contract as widening", () => {
    const after = {
      ...entry,
      target: [
        ...entry.target,
        { contract: "CSOROSWAP", fn: [{ name: "add_liquidity", cond: [] }] },
      ],
    };
    const diff = diffConfigs(cfg(entry), cfg(after));
    expect(diff).toContainEqual(
      expect.objectContaining({ direction: "widening", message: expect.stringContaining("new target") }),
    );
  });

  it("flags a removed function as narrowing", () => {
    const emptyFns: FnRule[] = [];
    const after = { ...entry, target: [{ contract: "CDEFINDEX", fn: emptyFns }] };
    const diff = diffConfigs(cfg(entry), cfg(after));
    expect(diff.some((d) => d.direction === "narrowing")).toBe(true);
  });
});
