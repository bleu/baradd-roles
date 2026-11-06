"use client";

import { useState } from "react";
import { connectWallet, SUPPORTED_SIGNER_WALLETS, type ConnectedWallet } from "@/lib/wallets";
import { shortAddr } from "@/lib/format";

/**
 * Connects real classic wallets to act as `Delegated` signers on an on-chain
 * rule. Only Freighter and Hana are offered — the other wallets this app's
 * dependency (@creit-tech/stellar-wallets-kit) wraps (xBull, Lobstr, Rabet,
 * Albedo) don't implement signAuthEntry, so they can sign a fee-paying
 * envelope but not an individual rule's authorization. See src/lib/wallets.ts.
 */
export function ConnectedWalletsPanel({
  connected,
  onConnect,
}: {
  connected: ConnectedWallet[];
  onConnect: (wallet: ConnectedWallet) => void;
}) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect(walletId: string) {
    setConnecting(walletId);
    setError(null);
    try {
      const wallet = await connectWallet(walletId);
      if (connected.some((w) => w.address === wallet.address)) {
        setError(`${wallet.walletName} is already connected as ${shortAddr(wallet.address)}.`);
        return;
      }
      onConnect(wallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : `Could not connect ${walletId}.`);
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div>
      <ul className="divide-y-[3px] divide-line rounded-2xl border-[3px] border-line">
        {connected.length === 0 && (
          <li className="px-4 py-3 text-sm text-mist">No wallets connected yet.</li>
        )}
        {connected.map((w) => (
          <li key={w.address} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <div>
              <div className="text-pale">{w.walletName}</div>
              <div className="font-mono text-xs text-mist">{w.address}</div>
            </div>
            <span className="rounded-2xl border-[3px] border-line px-2 py-0.5 text-xs text-mist">connected</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUPPORTED_SIGNER_WALLETS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => handleConnect(w.id)}
            disabled={connecting !== null}
            className="rounded-2xl border-[3px] border-line px-3 py-2 text-sm text-pale transition hover:border-mist disabled:opacity-50"
          >
            {connecting === w.id ? "Connecting…" : `Connect ${w.name}`}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-denied">{error}</p>}
    </div>
  );
}
