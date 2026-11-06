"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccountsStore } from "@/hooks/use-accounts-store";
import { shortAddr } from "@/lib/format";
import { RuleCard } from "@/components/rule-card";
import { setAccountPrefill } from "@/lib/onchain/account-prefill";
import type { SmartAccount } from "@/lib/types";

/**
 * Draft accounts only exist in this browser's localStorage — there's no
 * backend to 404 against, so a missing draft (wrong id, cleared storage,
 * different browser) shows this panel instead of a real HTTP 404.
 */
export function DraftAccountPage({ id }: { id: string }) {
  const { accounts } = useAccountsStore();
  const router = useRouter();

  const account = accounts.find((a) => a.id === id);
  if (!account) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/app" className="text-xs text-mist transition hover:text-pale">
          ← Chests
        </Link>
        <p className="mt-6 text-sm text-mist">
          No draft chest with this id in this browser. Drafts are saved to localStorage, so they
          don&apos;t carry over to another browser or device.
        </p>
      </div>
    );
  }

  function deployForReal(account: SmartAccount) {
    const adminRule = account.rules.find((r) => r.kind === "Admin");
    setAccountPrefill({ label: account.label, roleGroups: adminRule?.roleGroups ?? [] });
    router.push("/app/new/onchain");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Chests
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-pale">{account.label}</h1>
          <p className="mt-1 font-mono text-xs text-mist">{shortAddr(account.id, 10, 4)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-2xl border border-gold px-2 py-0.5 text-xs text-gold">Not deployed</span>
          <button
            type="button"
            onClick={() => deployForReal(account)}
            className="rounded-2xl border border-pale px-3 py-1.5 text-sm text-pale transition hover:bg-pale hover:text-obsidian"
          >
            Deploy on testnet →
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-mist">
        This only carries over the Governance/Admin signers to the real deploy form — rules still
        need adding again there, since each one installs separately on-chain.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {account.rules.map((rule) => (
          <RuleCard key={rule.id} accountId={account.id} rule={rule} />
        ))}
        <Link
          href={`/app/${account.id}/rules/new`}
          className="card-shadow flex items-center justify-center rounded-2xl border border-dashed border-line p-5 text-sm text-mist transition hover:border-mist hover:text-pale"
        >
          + Add rule
        </Link>
      </div>
    </div>
  );
}
