// Bookmarks which on-chain rule ids make up one logical multi-role-group
// rule — the deployed account contract has no such concept itself, only
// individual context rules, and a rule's on-chain name is capped at 20 bytes
// (stellar-accounts' MAX_NAME_SIZE), too short to encode this reliably in
// the name. Not a source of truth: if this is missing (a different browser,
// cleared storage), rule-view.ts just shows each rule id ungrouped, as its
// own "operator" rule — still a correct read of what's on chain, just not
// grouped as nicely.
import type { SignerRole } from "@/lib/types";

const STORAGE_KEY = "baradd:rule-groups:v1";

export interface StoredRuleGroup {
  name: string;
  entries: Array<{ ruleId: number; role: SignerRole }>;
}

type StoredData = Record<string, StoredRuleGroup[]>;

function read(): StoredData {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredData) : {};
  } catch {
    return {};
  }
}

function write(data: StoredData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore — this is a convenience bookmark, not required for correctness.
  }
}

export function recordRuleGroup(accountId: string, name: string, entries: StoredRuleGroup["entries"]): void {
  const data = read();
  const existing = data[accountId] ?? [];
  data[accountId] = [...existing.filter((g) => g.name !== name), { name, entries }];
  write(data);
}

export function getRuleGroups(accountId: string): StoredRuleGroup[] {
  return read()[accountId] ?? [];
}
