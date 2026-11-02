import Link from "next/link";
import { mockAccounts } from "@/lib/mock-data";
import { shortAddr } from "@/lib/format";

export default function AccountsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl text-foreground">Treasuries</h1>
      <p className="mt-2 max-w-xl text-muted">
        Smart accounts with a Stellar Roles policy installed. Illustrative data — connect a wallet
        and point this at testnet to see real accounts.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {mockAccounts.map((account) => {
          const exitRules = account.rules.filter((r) => r.kind === "Exit").length;
          const entryRules = account.rules.filter((r) => r.kind === "Entry").length;
          return (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              className="rounded-sm border border-border bg-surface p-6 transition hover:border-border-strong hover:bg-surface-raised"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl text-foreground">{account.label}</h2>
                  <p className="mt-1 font-mono text-xs text-muted-dim">{shortAddr(account.id, 6, 6)}</p>
                </div>
                <span className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted">
                  {account.network}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted">
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
