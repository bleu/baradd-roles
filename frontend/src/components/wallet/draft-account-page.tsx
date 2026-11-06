"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccountsStore } from "@/hooks/use-accounts-store";
import { shortAddr } from "@/lib/format";
import { RuleCard } from "@/components/rule-card";
import { Tag } from "@/components/ui/tag";
import { GovernanceCard } from "@/components/wallet/governance-card";
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

  const adminRule = account.rules.find((r) => r.kind === "Admin");
  const policyRules = account.rules.filter((r) => r.kind === "Rule");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Chests
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-pale">{account.label}</h1>
          <p className="mt-1 font-mono text-xs text-mist">{shortAddr(account.id, 10, 4)}</p>
        </div>
        <Tag tone="gold">Not deployed</Tag>
      </div>

      <div className="mt-6 flex items-stretch border-[3px] border-obsidian bg-surface" role="note">
        <span
          className="flex flex-none items-center border-r-[3px] border-obsidian px-4 font-mono text-xs font-bold"
          style={{ background: "var(--gold)" }}
        >
          DRAFT
        </span>
        <div className="flex flex-1 flex-wrap items-center justify-between gap-4 px-5 py-3.5">
          <p className="text-sm text-pale">
            This chest only exists in this browser. Deploying installs the same Governance/Admin
            signers for real — rules still need adding again there, since each one installs
            separately on-chain.
          </p>
          <button
            type="button"
            onClick={() => deployForReal(account)}
            className="btn-primary shrink-0 border-[3px] border-obsidian px-4 py-2 text-sm font-bold uppercase tracking-wide transition"
          >
            Deploy on testnet →
          </button>
        </div>
      </div>

      <div className="mt-10">
        <GovernanceCard adminRule={adminRule} />
      </div>

      <div className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Rules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policyRules.map((rule) => (
            <RuleCard key={rule.id} accountId={account.id} rule={rule} />
          ))}
          <Link
            href={`/app/${account.id}/rules/new`}
            className="card-shadow flex items-center justify-center border-[3px] border-dashed border-line p-5 text-sm text-mist transition hover:border-mist hover:text-pale"
          >
            + Add rule
          </Link>
        </div>
      </div>
    </div>
  );
}
