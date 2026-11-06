import { describe, expect, it } from "vitest";
import { StrKey } from "@stellar/stellar-sdk";
import { installParamsToScVal } from "./install-params.js";
import { ROLES_CONFIG_TYPE, rolesPolicySpec } from "./roles-policy-spec.js";
import type { RuleConfig } from "../types.js";

// StrKey.encodeContract requires a real 32-byte checksum-valid address —
// installParamsToScVal builds a genuine Address internally, so (unlike
// lint.test.ts's placeholder strings) these fixtures need to be valid.
const CONTRACT = StrKey.encodeContract(new Uint8Array(32).fill(1));
const USDC = StrKey.encodeContract(new Uint8Array(32).fill(2));
const DEST = StrKey.encodeContract(new Uint8Array(32).fill(3));

const EXIT_RULE: RuleConfig = {
  name: "exit-defindex",
  mode: "exit",
  threshold: 1,
  signers: ["GOP1", "GOP2"],
  target: [
    {
      contract: CONTRACT,
      label: "DeFindex vault",
      fn: [{ name: "withdraw", cond: [{ op: "eq_self", arg: 0 }] }],
    },
  ],
};

const ENTRY_RULE: RuleConfig = {
  name: "entry-defindex",
  mode: "entry",
  threshold: 2,
  signers: ["GOP1", "GAP1", "GAP2"],
  target: [
    {
      contract: CONTRACT,
      fn: [{ name: "deposit", cond: [{ op: "range", arg: 1, min: "0", max: "500000000000" }] }],
    },
    {
      contract: USDC,
      fn: [
        {
          name: "transfer",
          cond: [
            { op: "eq_self", arg: 0 },
            { op: "eq", arg: 1, type: "address", value: DEST },
          ],
        },
        { name: "approve", cond: [{ op: "one_of", arg: 0, type: "address", values: [DEST, CONTRACT] }] },
      ],
    },
  ],
};

describe("installParamsToScVal", () => {
  it("round-trips a single-target exit rule through real XDR encoding", () => {
    const scval = installParamsToScVal(EXIT_RULE);
    const decoded = rolesPolicySpec.scValToNative(scval, ROLES_CONFIG_TYPE);
    expect(decoded).toEqual({
      mode: { tag: "Exit" },
      targets: [
        {
          contract: CONTRACT,
          fns: [{ name: "withdraw", conds: [{ tag: "EqSelf", values: [0] }] }],
        },
      ],
    });
  });

  it("round-trips a multi-target entry rule with range/eq/one_of conditions", () => {
    const scval = installParamsToScVal(ENTRY_RULE);
    const decoded = rolesPolicySpec.scValToNative(scval, ROLES_CONFIG_TYPE);
    expect(decoded).toEqual({
      mode: { tag: "Entry" },
      targets: [
        {
          contract: CONTRACT,
          fns: [{ name: "deposit", conds: [{ tag: "Range", values: [1, 0n, 500000000000n] }] }],
        },
        {
          contract: USDC,
          fns: [
            {
              name: "transfer",
              conds: [
                { tag: "EqSelf", values: [0] },
                { tag: "Eq", values: [1, { tag: "Address", values: [DEST] }] },
              ],
            },
            {
              name: "approve",
              conds: [
                {
                  tag: "OneOf",
                  values: [
                    0,
                    [
                      { tag: "Address", values: [DEST] },
                      { tag: "Address", values: [CONTRACT] },
                    ],
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
