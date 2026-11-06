import Link from "next/link";
import { mockAccounts } from "@/lib/mock-data";
import { shortAddr } from "@/lib/format";
import { Tag } from "@/components/ui/tag";
import { KeyholeRow } from "@/components/ui/keyhole";
import { DraftAccountsList } from "@/components/wallet/draft-accounts-list";
import { OnchainAccountsList } from "@/components/wallet/onchain-accounts-list";

export default function AccountsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-pale">Chests</h1>
          <p className="mt-2 max-w-xl text-mist">
            Smart accounts with a Baradd Roles policy installed. The chest below is demo data —
            no live chest is connected.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/app/new"
            className="border-[3px] border-obsidian px-4 py-2 text-sm font-bold uppercase tracking-wide text-pale transition hover:opacity-70"
          >
            New draft
          </Link>
          <Link
            href="/app/new/onchain"
            className="btn-primary border-[3px] border-obsidian px-4 py-2 text-sm font-bold uppercase tracking-wide transition"
          >
            Deploy on testnet
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Example</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mockAccounts.map((account) => {
            const ruleCount = account.rules.filter((r) => r.kind === "Rule").length;
            const adminGroup = account.rules.find((r) => r.kind === "Admin")?.roleGroups[0];
            return (
              <Link
                key={account.id}
                href={`/app/${account.id}`}
                className="card-shadow group block border-[3px] border-line bg-surface p-6 transition hover:border-mist"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl text-pale">{account.label}</h3>
                    <p className="mt-1 font-mono text-xs text-mist">{shortAddr(account.id, 6, 6)}</p>
                  </div>
                  <Tag tone="dashed">{account.network}</Tag>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-mist">
                    {ruleCount} rule{ruleCount === 1 ? "" : "s"}
                  </p>
                  {adminGroup && (
                    <KeyholeRow total={adminGroup.signers.length} required={adminGroup.threshold} size={14} />
                  )}
                </div>
                <span className="mt-4 inline-block text-xs text-mist transition group-hover:text-pale">
                  Open chest →
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <DraftAccountsList />
      <OnchainAccountsList />
    </div>
  );
}
