"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ContextRule } from "@/lib/types";
import * as store from "@/lib/accounts-store";

/**
 * Reads draft accounts via useSyncExternalStore: React renders the empty
 * server snapshot on the first client pass (matching SSR, no hydration
 * warning), then swaps in the real localStorage snapshot right after
 * hydration. Each page/route calls this independently rather than sharing a
 * context — there's only ever one consumer tree per route in this app.
 */
export function useAccountsStore() {
  const accounts = useSyncExternalStore(
    store.subscribe,
    store.getAccountsSnapshot,
    store.getServerAccountsSnapshot,
  );

  const createAccount = useCallback((input: Parameters<typeof store.createAccount>[0]) => {
    return store.createAccount(input);
  }, []);

  const addRule = useCallback((accountId: string, input: Omit<ContextRule, "id">) => {
    return store.addRule(accountId, input);
  }, []);

  const updateRule = useCallback((accountId: string, ruleId: number, patch: Partial<ContextRule>) => {
    store.updateRule(accountId, ruleId, patch);
  }, []);

  return { accounts, createAccount, addRule, updateRule };
}
