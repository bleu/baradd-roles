// One-shot hand-off from a draft chest to the real on-chain creation form:
// sessionStorage (not localStorage) because this is only ever meant to
// survive the single navigation from the draft page to /app/new/onchain,
// not to persist across sessions.
import type { RoleGroup } from "@/lib/types";

const STORAGE_KEY = "baradd:onchain-prefill:v1";

export interface AccountPrefill {
  label: string;
  roleGroups: RoleGroup[];
}

export function setAccountPrefill(prefill: AccountPrefill): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prefill));
  } catch {
    // Ignore — worst case the form just starts empty.
  }
}

/** Reads and clears the prefill — it's only meant to apply once. */
export function takeAccountPrefill(): AccountPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as AccountPrefill;
  } catch {
    return null;
  }
}
