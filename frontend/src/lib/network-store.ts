// Global, app-wide network selection (shown in the header). Persisted to
// localStorage so it survives reloads, same useSyncExternalStore pattern as
// accounts-store.ts/onchain-accounts-store.ts. Mainnet has no verified
// contract addresses yet (see lib/onchain/config.ts), so it's accepted here
// as a valid NetworkId — the UI disables selecting it — but setNetwork()
// itself also refuses it, in case that ever changes.
export type NetworkId = "testnet" | "mainnet";

const STORAGE_KEY = "baradd:network:v1";
const DEFAULT_NETWORK: NetworkId = "testnet";
const SELECTABLE_NETWORKS: NetworkId[] = ["testnet"];

let cache: NetworkId | null = null;
const listeners = new Set<() => void>();

function isNetworkId(value: unknown): value is NetworkId {
  return value === "testnet" || value === "mainnet";
}

function readFromStorage(): NetworkId {
  if (typeof window === "undefined") return DEFAULT_NETWORK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isNetworkId(raw) && SELECTABLE_NETWORKS.includes(raw)) return raw;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to default.
  }
  return DEFAULT_NETWORK;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): NetworkId {
  if (cache === null) cache = readFromStorage();
  return cache;
}

export function getServerSnapshot(): NetworkId {
  return DEFAULT_NETWORK;
}

export function setNetwork(network: NetworkId): void {
  if (!SELECTABLE_NETWORKS.includes(network)) return;
  cache = network;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, network);
    } catch {
      // Ignore — the in-memory cache still reflects the selection for this session.
    }
  }
  for (const listener of listeners) listener();
}
