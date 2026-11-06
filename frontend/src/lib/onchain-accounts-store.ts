// Bookmarks real, already-deployed on-chain smart accounts in this browser
// so the Chests page can list "your on-chain chests" — never a
// source of truth, just a pointer. The account/rule pages always re-read the
// real state from chain (src/lib/onchain/read-account.ts). Follows the same
// useSyncExternalStore pattern as accounts-store.ts.
import type { NetworkId } from "@/lib/network-store";

export interface OnchainAccountPointer {
  id: string;
  label: string;
  network: NetworkId;
  createdAt: string;
}

const STORAGE_KEY = "baradd:onchain-accounts:v1";

const EMPTY: OnchainAccountPointer[] = [];
let cache: OnchainAccountPointer[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): OnchainAccountPointer[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OnchainAccountPointer[]) : [];
  } catch {
    return [];
  }
}

function persist(pointers: OnchainAccountPointer[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pointers));
  }
  cache = null;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): OnchainAccountPointer[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

export function getServerSnapshot(): OnchainAccountPointer[] {
  return EMPTY;
}

export function addPointer(pointer: Omit<OnchainAccountPointer, "createdAt">): void {
  const pointers = getSnapshot();
  if (pointers.some((p) => p.id === pointer.id)) return;
  persist([...pointers, { ...pointer, createdAt: new Date().toISOString() }]);
}
