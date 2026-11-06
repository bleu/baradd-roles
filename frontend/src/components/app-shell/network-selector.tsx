"use client";

import { useNetwork } from "@/hooks/use-network";
import type { NetworkId } from "@/lib/network-store";

const NETWORKS: Array<{ id: NetworkId; label: string }> = [
  { id: "testnet", label: "Testnet" },
  { id: "mainnet", label: "Mainnet · Locked" },
];

export function NetworkSelector() {
  const { network, setNetwork } = useNetwork();

  return (
    <div role="group" aria-label="Network" className="flex border-[3px] border-obsidian">
      {NETWORKS.map((n) => {
        const disabled = n.id === "mainnet";
        const active = network === n.id;
        return (
          <button
            key={n.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => setNetwork(n.id)}
            title={disabled ? "Mainnet isn't supported yet — no verified mainnet contract addresses." : undefined}
            className={`min-h-[44px] px-4 font-mono text-xs font-bold uppercase ${
              active ? "" : disabled ? "hatch cursor-not-allowed" : "text-mist hover:text-pale"
            }`}
            style={active ? { background: "var(--obsidian)", color: "var(--surface)" } : undefined}
          >
            {n.label}
          </button>
        );
      })}
    </div>
  );
}
