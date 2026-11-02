"use client";

import { useEffect, useState } from "react";
import { connectFreighter, readFreighterAddress, type WalletState } from "@/lib/wallet";
import { shortAddr } from "@/lib/format";

export function ConnectWalletButton() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    readFreighterAddress().then(setWallet).catch(() => {});
  }, []);

  async function onConnect() {
    setPending(true);
    setError(null);
    try {
      const w = await connectFreighter();
      setWallet(w);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect.");
    } finally {
      setPending(false);
    }
  }

  if (wallet) {
    return (
      <div className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm text-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        <span className="font-sans tracking-wide">{shortAddr(wallet.address)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onConnect}
        disabled={pending}
        className="rounded-sm border border-gold-dim bg-surface px-3 py-1.5 text-sm text-gold transition hover:border-gold hover:bg-surface-raised disabled:opacity-60"
      >
        {pending ? "Opening Freighter…" : "Connect wallet"}
      </button>
      {error && <span className="max-w-[16rem] text-right text-xs text-rust">{error}</span>}
    </div>
  );
}
