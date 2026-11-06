// Persists user-created smart accounts in the browser. There is no backend
// in this project, so this is a draft workspace, not a chest: a draft
// account only exists in this browser's localStorage until its owner
// deploys `roles-policy` to testnet and installs it for real via
// `roles apply` (see cli/src/commands/apply.ts). Draft IDs are prefixed so
// the UI never mistakes one for a real 56-character contract address.
//
// Exposes subscribe/getSnapshot/getServerSnapshot so components read this
// through useSyncExternalStore (src/hooks/use-accounts-store.ts) rather than
// useEffect+setState — the sanctioned way to read browser-only state without
// a hydration mismatch: React renders the empty server snapshot on the first
// client pass, then swaps in the real one right after hydration.
import type { ContextRule, RoleGroup, SmartAccount } from "./types";

// Bumped from v1: that shape predates the Governance/Admin/Operator redesign
// (flat signers+threshold per rule, no roleGroups) and would otherwise crash
// every renderer that reads rule.roleGroups — confirmed live on baradd.xyz
// (a stale v1 draft took down the whole account/rule page with
// "Cannot read properties of undefined (reading 'map')"). Bumping orphans
// that old data immediately; isValidAccount below guards against the same
// class of bug for any future shape change, regardless of key name.
const STORAGE_KEY = "baradd:user-accounts:v2";
const DRAFT_PREFIX = "DRAFT-";

const EMPTY: SmartAccount[] = [];
let cache: SmartAccount[] | null = null;
const listeners = new Set<() => void>();

export function isDraftId(id: string): boolean {
  return id.startsWith(DRAFT_PREFIX);
}

/** Test-only: clears the in-memory snapshot cache after tests clear localStorage directly. */
export function __resetCacheForTests(): void {
  cache = null;
}

function newDraftId(): string {
  return `${DRAFT_PREFIX}${crypto.randomUUID()}`;
}

function isValidRule(rule: unknown): rule is ContextRule {
  if (typeof rule !== "object" || rule === null) return false;
  const r = rule as Record<string, unknown>;
  return typeof r.id === "number" && typeof r.name === "string" && Array.isArray(r.roleGroups);
}

function isValidAccount(account: unknown): account is SmartAccount {
  if (typeof account !== "object" || account === null) return false;
  const a = account as Record<string, unknown>;
  return (
    typeof a.id === "string" &&
    typeof a.label === "string" &&
    Array.isArray(a.rules) &&
    a.rules.every(isValidRule)
  );
}

function readFromStorage(): SmartAccount[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Never let a stale or corrupt draft (a different browser tab update,
    // a future shape change) crash the whole page — just drop it.
    return parsed.filter(isValidAccount);
  } catch {
    return [];
  }
}

function persist(accounts: SmartAccount[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }
  cache = null;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccountsSnapshot(): SmartAccount[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

export function getServerAccountsSnapshot(): SmartAccount[] {
  return EMPTY;
}

/** One-off read outside of React (not reactive) — prefer useAccountsStore() in components. */
export function loadUserAccounts(): SmartAccount[] {
  return getAccountsSnapshot();
}

export function findUserAccount(id: string): SmartAccount | undefined {
  return getAccountsSnapshot().find((a) => a.id === id);
}

export function createAccount(input: {
  label: string;
  network: "testnet" | "mainnet";
  adminRoleGroups: RoleGroup[];
}): SmartAccount {
  const account: SmartAccount = {
    id: newDraftId(),
    label: input.label,
    network: input.network,
    rules: [
      {
        id: 0,
        kind: "Admin",
        name: "Governance & Admin",
        roleGroups: input.adminRoleGroups,
      },
    ],
  };
  const accounts = [...getAccountsSnapshot(), account];
  persist(accounts);
  return account;
}

export function addRule(accountId: string, input: Omit<ContextRule, "id">): ContextRule {
  const accounts = getAccountsSnapshot().map((a) => (a.id === accountId ? { ...a, rules: [...a.rules] } : a));
  const account = accounts.find((a) => a.id === accountId);
  if (!account) throw new Error(`No draft account with id ${accountId}`);
  const nextId = account.rules.reduce((max, r) => Math.max(max, r.id), -1) + 1;
  const rule: ContextRule = { ...input, id: nextId };
  account.rules.push(rule);
  persist(accounts);
  return rule;
}

export function updateRule(accountId: string, ruleId: number, patch: Partial<ContextRule>): void {
  const accounts = getAccountsSnapshot().map((a) =>
    a.id === accountId
      ? { ...a, rules: a.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)) }
      : a,
  );
  const found = accounts.find((a) => a.id === accountId)?.rules.find((r) => r.id === ruleId);
  if (!found) throw new Error(`No draft rule ${accountId}/${ruleId}`);
  persist(accounts);
}
