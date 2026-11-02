import type { SmartAccount } from "./types";

// Placeholder data for the UI shell. Addresses are illustrative, not real
// deployed contracts — nothing here is read from testnet or mainnet yet.
// Replace with `get_config` reads once a policy and preset are deployed
// (see docs/spec.md, "MVP scope").

const OPERATOR_1 = "GAOPERATOR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const OPERATOR_2 = "GAOPERATOR2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const APPROVER_1 = "GAAPPROVER1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const APPROVER_2 = "GAAPPROVER2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const APPROVER_3 = "GAAPPROVER3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const GOV_1 = "GAGOVERNANCE1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const GOV_2 = "GAGOVERNANCE2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const GOV_3 = "GAGOVERNANCE3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

const DEFINDEX = "CDEFINDEXVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const SOROSWAP = "CSOROSWAPPOOLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const USDC = "CUSDCTOKENXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

const TREASURY_ACCOUNT = "CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

export const mockAccounts: SmartAccount[] = [
  {
    id: TREASURY_ACCOUNT,
    label: "Main treasury",
    network: "testnet",
    rules: [
      {
        id: 0,
        kind: "Admin",
        name: "Governance",
        threshold: 2,
        signers: [{ address: GOV_1, label: "Gov 1" }, { address: GOV_2, label: "Gov 2" }, { address: GOV_3, label: "Gov 3" }],
      },
      {
        id: 1,
        kind: "Exit",
        name: "Exit · DeFindex",
        threshold: 1,
        signers: [{ address: OPERATOR_1, label: "Operator 1" }, { address: OPERATOR_2, label: "Operator 2" }],
        protocolLabel: "DeFindex vault",
        config: {
          mode: "Exit",
          targets: [
            {
              contract: DEFINDEX,
              label: "DeFindex vault",
              fns: [{ name: "withdraw", conds: [{ kind: "EqSelf", arg: 0 }] }],
            },
          ],
        },
      },
      {
        id: 2,
        kind: "Entry",
        name: "Entry · DeFindex",
        threshold: 2,
        signers: [
          { address: OPERATOR_1, label: "Operator 1" },
          { address: APPROVER_1, label: "Approver 1" },
          { address: APPROVER_2, label: "Approver 2" },
        ],
        protocolLabel: "DeFindex vault",
        config: {
          mode: "Entry",
          targets: [
            {
              contract: DEFINDEX,
              label: "DeFindex vault",
              fns: [
                { name: "deposit", conds: [{ kind: "Range", arg: 1, min: "0", max: "500000000000" }] },
              ],
            },
            {
              contract: USDC,
              label: "USDC token",
              fns: [
                { name: "transfer", conds: [{ kind: "EqSelf", arg: 0 }, { kind: "Eq", arg: 1, value: { kind: "address", value: DEFINDEX } }] },
                { name: "approve", conds: [{ kind: "EqSelf", arg: 0 }, { kind: "Eq", arg: 1, value: { kind: "address", value: DEFINDEX } }] },
              ],
            },
          ],
        },
      },
      {
        id: 3,
        kind: "Exit",
        name: "Exit · Soroswap",
        threshold: 1,
        signers: [{ address: OPERATOR_1, label: "Operator 1" }, { address: OPERATOR_2, label: "Operator 2" }],
        protocolLabel: "Soroswap pool",
        config: {
          mode: "Exit",
          targets: [
            {
              contract: SOROSWAP,
              label: "Soroswap pool",
              fns: [{ name: "remove_liquidity", conds: [{ kind: "EqSelf", arg: 0 }] }],
            },
          ],
        },
      },
      {
        id: 4,
        kind: "Entry",
        name: "Entry · Soroswap",
        threshold: 3,
        signers: [
          { address: OPERATOR_1, label: "Operator 1" },
          { address: APPROVER_1, label: "Approver 1" },
          { address: APPROVER_2, label: "Approver 2" },
          { address: APPROVER_3, label: "Approver 3" },
        ],
        protocolLabel: "Soroswap pool",
        config: {
          mode: "Entry",
          targets: [
            {
              contract: SOROSWAP,
              label: "Soroswap pool",
              fns: [
                {
                  name: "add_liquidity",
                  conds: [{ kind: "OneOf", arg: 0, values: [{ kind: "address", value: USDC }] }],
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

export function findAccount(id: string): SmartAccount | undefined {
  return mockAccounts.find((a) => a.id === id);
}

export function findRule(accountId: string, ruleId: number) {
  return findAccount(accountId)?.rules.find((r) => r.id === ruleId);
}
