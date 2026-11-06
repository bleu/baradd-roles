"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { shortAddr } from "@/lib/format";
import { RoleGroupsView } from "@/components/role-groups-view";
import { PolicyView } from "@/components/policy-view";
import { RuleHeader } from "@/components/wallet/rule-header";
import { getOnchainRuleViews } from "@/lib/onchain/rule-view";
import { useNetwork } from "@/hooks/use-network";
import type { ContextRule } from "@/lib/types";

export function OnchainRulePage({ accountId, ruleId }: { accountId: string; ruleId: number }) {
  const { network } = useNetwork();
  const [rules, setRules] = useState<ContextRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnchainRuleViews(accountId, network)
      .then((r) => {
        if (!cancelled) setRules(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not read this account from chain.");
      });
    return () => {
      cancelled = true;
    };
  }, [accountId, network]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/app/${accountId}`} className="text-xs text-mist transition hover:text-pale">
          ← Chest
        </Link>
        <p className="mt-6 text-sm text-denied">{error}</p>
      </div>
    );
  }

  if (!rules) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/app/${accountId}`} className="text-xs text-mist transition hover:text-pale">
          ← Chest
        </Link>
        <p className="mt-6 text-sm text-mist">Reading rule from chain…</p>
      </div>
    );
  }

  const rule = rules.find((r) => r.id === ruleId);
  if (!rule) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/app/${accountId}`} className="text-xs text-mist transition hover:text-pale">
          ← Chest
        </Link>
        <p className="mt-6 text-sm text-mist">No rule with id {ruleId} on this account.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <RuleHeader backHref={`/app/${accountId}`} backLabel={shortAddr(accountId, 8, 4)} rule={rule} />

      <section className="mt-10 border-[3px] border-line bg-surface p-6">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Signers</h2>
        <div className="mt-3">
          <RoleGroupsView roleGroups={rule.roleGroups} />
        </div>
      </section>

      {rule.target ? (
        <section className="mt-10 border-[3px] border-line bg-surface p-6">
          <h2 className="text-xs tracking-[0.2em] text-mist uppercase">What it allows</h2>
          <p className="mt-2 text-sm text-mist">
            Deny-by-default: any contract, function, or argument not listed below is rejected.
          </p>
          <div className="mt-3">
            <PolicyView target={rule.target} />
          </div>
        </section>
      ) : (
        <section className="mt-10 border-[3px] border-line bg-surface p-6 text-sm text-mist">
          This is an Admin rule — it has no RolesPolicy attached. Its signers can change rules and
          install or remove policies on the other rules.
        </section>
      )}
    </div>
  );
}
