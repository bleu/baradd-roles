"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as store from "@/lib/network-store";

export function useNetwork() {
  const network = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const setNetwork = useCallback((network: Parameters<typeof store.setNetwork>[0]) => {
    store.setNetwork(network);
  }, []);

  return { network, setNetwork };
}
