"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as store from "@/lib/onchain-accounts-store";

export function useOnchainAccountsStore() {
  const pointers = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const addPointer = useCallback((pointer: Parameters<typeof store.addPointer>[0]) => {
    store.addPointer(pointer);
  }, []);

  return { pointers, addPointer };
}
