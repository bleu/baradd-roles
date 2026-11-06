"use client";

import Link from "next/link";
import { useAccountsStore } from "@/hooks/use-accounts-store";
import { shortAddr } from "@/lib/format";
import { Tag } from "@/components/ui/tag";
import { KeyholeRow } from "@/components/ui/keyhole";

export function DraftAccountsList() {
  const { accounts } = useAccountsStore();

  if (accounts.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Drafts in this browser</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {accounts.map((account) => {
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
                  <p className="mt-1 font-mono text-xs text-mist">{shortAddr(account.id, 10, 4)}</p>
                </div>
                <Tag tone="gold">Draft</Tag>
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
  );
}
