"use client";

import { isConnected, requestAccess, getAddress, getNetwork } from "@stellar/freighter-api";

export interface WalletState {
  address: string;
  network: string;
}

/** Connects to Freighter, if installed, and returns the active address and network. */
export async function connectFreighter(): Promise<WalletState> {
  const connected = await isConnected();
  if (connected.error || !connected.isConnected) {
    throw new Error("Freighter is not installed or not reachable in this browser.");
  }

  const access = await requestAccess();
  if (access.error) {
    throw new Error(access.error.message ?? "Freighter denied access.");
  }

  const network = await getNetwork();
  return { address: access.address, network: network.network ?? "UNKNOWN" };
}

/** Reads the current address without prompting, if access was already granted. */
export async function readFreighterAddress(): Promise<WalletState | null> {
  const connected = await isConnected();
  if (connected.error || !connected.isConnected) return null;

  const addr = await getAddress();
  if (addr.error || !addr.address) return null;

  const network = await getNetwork();
  return { address: addr.address, network: network.network ?? "UNKNOWN" };
}
