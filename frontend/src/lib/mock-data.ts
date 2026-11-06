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

const EXAMPLE_VAULT = "CEXAMPLEVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const SOROSWAP = "CSOROSWAPPOOLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const USDC = "CUSDCTOKENXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

const CHEST_ACCOUNT = "CCHESTACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

export const mockAccounts: SmartAccount[] = [
  {
    id: CHEST_ACCOUNT,
    label: "Main chest",
    network: "testnet",
    rules: [
      {
        id: 0,
        kind: "Admin",
        name: "Governance & Admin",
        roleGroups: [
          {
            role: "governance",
            signers: [{ address: GOV_1, label: "Gov 1" }, { address: GOV_2, label: "Gov 2" }, { address: GOV_3, label: "Gov 3" }],
            threshold: 2,
          },
        ],
      },
      {
        id: 1,
        kind: "Rule",
        name: "Example Vault withdraw",
        roleGroups: [
          { role: "operator", signers: [{ address: OPERATOR_1, label: "Operator 1" }, { address: OPERATOR_2, label: "Operator 2" }], threshold: 1 },
        ],
        target: {
          contract: EXAMPLE_VAULT,
          label: "Example vault",
          fns: [{ name: "withdraw", conds: [{ kind: "EqSelf", arg: 0 }] }],
        },
      },
      {
        id: 2,
        kind: "Rule",
        name: "Example Vault deposit",
        roleGroups: [
          {
            role: "operator",
            signers: [
              { address: OPERATOR_1, label: "Operator 1" },
              { address: APPROVER_1, label: "Approver 1" },
              { address: APPROVER_2, label: "Approver 2" },
            ],
            threshold: 2,
          },
        ],
        target: {
          contract: EXAMPLE_VAULT,
          label: "Example vault",
          fns: [{ name: "deposit", conds: [{ kind: "Range", arg: 1, min: "0", max: "500000000000" }] }],
        },
      },
      {
        id: 3,
        kind: "Rule",
        name: "USDC approve for Example Vault",
        roleGroups: [
          {
            role: "operator",
            signers: [
              { address: OPERATOR_1, label: "Operator 1" },
              { address: APPROVER_1, label: "Approver 1" },
              { address: APPROVER_2, label: "Approver 2" },
            ],
            threshold: 2,
          },
        ],
        target: {
          contract: USDC,
          label: "USDC token",
          fns: [
            { name: "transfer", conds: [{ kind: "EqSelf", arg: 0 }, { kind: "Eq", arg: 1, value: { kind: "address", value: EXAMPLE_VAULT } }] },
            { name: "approve", conds: [{ kind: "EqSelf", arg: 0 }, { kind: "Eq", arg: 1, value: { kind: "address", value: EXAMPLE_VAULT } }] },
          ],
        },
      },
      {
        id: 4,
        kind: "Rule",
        name: "Soroswap remove liquidity",
        roleGroups: [
          { role: "operator", signers: [{ address: OPERATOR_1, label: "Operator 1" }, { address: OPERATOR_2, label: "Operator 2" }], threshold: 1 },
        ],
        target: {
          contract: SOROSWAP,
          label: "Soroswap pool",
          fns: [{ name: "remove_liquidity", conds: [{ kind: "EqSelf", arg: 0 }] }],
        },
      },
      {
        id: 5,
        kind: "Rule",
        name: "Soroswap add liquidity",
        roleGroups: [
          {
            role: "operator",
            signers: [
              { address: OPERATOR_1, label: "Operator 1" },
              { address: APPROVER_1, label: "Approver 1" },
              { address: APPROVER_2, label: "Approver 2" },
              { address: APPROVER_3, label: "Approver 3" },
            ],
            threshold: 3,
          },
        ],
        target: {
          contract: SOROSWAP,
          label: "Soroswap pool",
          fns: [
            {
              name: "add_liquidity",
              conds: [{ kind: "OneOf", arg: 0, values: [{ kind: "address", value: USDC }] }],
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
