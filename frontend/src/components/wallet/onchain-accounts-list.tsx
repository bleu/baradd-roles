"use client";

import Link from "next/link";
import { useOnchainAccountsStore } from "@/hooks/use-onchain-accounts-store";
import { shortAddr } from "@/lib/format";
import { Tag } from "@/components/ui/tag";

/** Bookmarks only — the account page itself always re-reads the real state from chain. */
export function OnchainAccountsList() {
  const { pointers } = useOnchainAccountsStore();

  if (pointers.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xs tracking-[0.2em] text-mist uppercase">On-chain, bookmarked</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {pointers.map((pointer) => (
          <Link
            key={pointer.id}
            href={`/app/${pointer.id}`}
            className="card-shadow group block border-[3px] border-line bg-surface p-6 transition hover:border-mist"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl text-pale">{pointer.label}</h3>
                <p className="mt-1 font-mono text-xs text-mist">{shortAddr(pointer.id, 10, 4)}</p>
              </div>
              <Tag tone="ink">{pointer.network}</Tag>
            </div>
            <span className="mt-4 inline-block text-xs text-mist transition group-hover:text-pale">
              Open chest →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
