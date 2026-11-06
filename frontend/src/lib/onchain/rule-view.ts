// Assembles the real on-chain context rules for an account back into this
// app's plain ContextRule[] shape (src/lib/types.ts) — the same shape the
// draft flow uses, so OnchainAccountPage/OnchainRulePage can reuse
// RuleCard/RoleGroupsView/PolicyView unchanged.
//
// The deployed account contract has no "role" or "logical rule" concept —
// only individual context rules (signers + threshold policy + optional
// RolesPolicy), and names are capped at 20 bytes (too short to encode a role
// in). Grouping relies on:
// - Admin authority: rule-id order — the lowest-id Default-type rule is
//   Governance (the constructor names it itself, we don't control that),
//   any later Default-type rule is Admin.
// - Generic rules: a local bookmark (rule-groups-store.ts) recorded when
//   this browser created the rule. Missing that bookmark (a different
//   browser, cleared storage) just means each on-chain rule id shows up
//   ungrouped as its own "operator" rule — still a correct read of what's on
//   chain, just not reassembled as nicely.
import type { ContextRule, RoleGroup, Signer, SignerRole, Target } from "@/lib/types";
import type { NetworkId } from "@/lib/network-store";
import { getAccountRules, getRolesConfig, getThreshold, type OnchainContextRule } from "./read-account";
import { getNetworkConfig, type OnchainNetworkConfigValues } from "./config";
import { getRuleGroups } from "./rule-groups-store";

function nativeSignerToSigner(s: { tag: string; values: unknown[] }): Signer {
  const address = s.values[0] as string;
  return { address, label: s.tag === "External" ? "External (passkey/Ed25519)" : undefined };
}

async function toRoleGroup(
  rule: OnchainContextRule,
  accountId: string,
  role: SignerRole,
  config: OnchainNetworkConfigValues,
): Promise<RoleGroup> {
  const signers = rule.signers.map(nativeSignerToSigner);
  let threshold = signers.length;
  if (rule.policies.includes(config.thresholdPolicyAddress)) {
    try {
      threshold = await getThreshold(accountId, rule.id, config.thresholdPolicyAddress, { rpcUrl: config.rpcUrl });
    } catch {
      // Policy address present but unreadable — fall back to N-of-N rather than fail the whole page.
    }
  }
  return { role, signers, threshold };
}

export async function getOnchainRuleViews(accountId: string, network: NetworkId): Promise<ContextRule[]> {
  const config = getNetworkConfig(network);
  const onchainRules = await getAccountRules(accountId, { rpcUrl: config.rpcUrl });

  const adminRules = onchainRules.filter((r) => r.contextType.tag === "Default").sort((a, b) => a.id - b.id);
  const genericRules = onchainRules.filter((r) => r.contextType.tag === "CallContract");

  const result: ContextRule[] = [];

  if (adminRules.length > 0) {
    const roleGroups: RoleGroup[] = [];
    for (let i = 0; i < adminRules.length; i++) {
      const role: SignerRole = i === 0 ? "governance" : "admin";
      roleGroups.push(await toRoleGroup(adminRules[i], accountId, role, config));
    }
    result.push({ id: adminRules[0].id, kind: "Admin", name: "Governance & Admin", roleGroups });
  }

  const ruleIdToGroup = new Map<number, { name: string; role: SignerRole }>();
  for (const stored of getRuleGroups(accountId)) {
    for (const entry of stored.entries) ruleIdToGroup.set(entry.ruleId, { name: stored.name, role: entry.role });
  }

  interface GenericGroup {
    name: string;
    ids: number[];
    entries: Array<{ rule: OnchainContextRule; role: SignerRole }>;
  }
  const groups = new Map<string, GenericGroup>();
  for (const rule of genericRules) {
    const bookmark = ruleIdToGroup.get(rule.id);
    const name = bookmark?.name ?? rule.name;
    const role = bookmark?.role ?? "operator";
    // Ungrouped rules (no bookmark) each get a unique key so they never
    // accidentally merge just because they happen to share a name.
    const key = bookmark ? `g:${name}` : `r:${rule.id}`;
    const group = groups.get(key) ?? { name, ids: [], entries: [] };
    group.ids.push(rule.id);
    group.entries.push({ rule, role });
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    const roleGroups: RoleGroup[] = [];
    let target: Target | undefined;
    for (const { rule, role } of group.entries) {
      roleGroups.push(await toRoleGroup(rule, accountId, role, config));
      if (!target && rule.policies.includes(config.rolesPolicyAddress)) {
        try {
          target = await getRolesConfig(accountId, rule.id, config.rolesPolicyAddress, { rpcUrl: config.rpcUrl });
        } catch {
          // Policy address present but config unreadable — leave target unset rather than fail the whole page.
        }
      }
    }
    result.push({
      id: Math.min(...group.ids),
      kind: "Rule",
      name: group.name,
      roleGroups,
      target,
    });
  }

  return result.sort((a, b) => a.id - b.id);
}
