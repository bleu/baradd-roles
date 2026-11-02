import Link from "next/link";
import { mockAccounts } from "@/lib/mock-data";
import { shortAddr } from "@/lib/format";

export default function AccountsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Treasuries</h1>
      <p className="mt-2 max-w-xl text-stone">
        Smart accounts with a Barad Roles policy installed. Demo data — no live treasury is
        connected.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {mockAccounts.map((account) => {
          const exitRules = account.rules.filter((r) => r.kind === "Exit").length;
          const entryRules = account.rules.filter((r) => r.kind === "Entry").length;
          return (
            <Link
              key={account.id}
              href={`/app/${account.id}`}
              className="rounded-sm border border-line bg-surface p-6 transition hover:border-stone"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl text-ink">{account.label}</h2>
                  <p className="mt-1 font-mono text-xs text-stone">{shortAddr(account.id, 6, 6)}</p>
                </div>
                <span className="rounded-sm border border-line px-2 py-0.5 text-xs text-stone">
                  {account.network}
                </span>
              </div>
              <p className="mt-4 text-sm text-stone">
                {exitRules} exit rule{exitRules === 1 ? "" : "s"}, {entryRules} entry rule
                {entryRules === 1 ? "" : "s"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
