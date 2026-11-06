"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { shortAddr } from "@/lib/format";
import { RuleCard } from "@/components/rule-card";
import { Tag } from "@/components/ui/tag";
import { GovernanceCard } from "@/components/wallet/governance-card";
import { getOnchainRuleViews } from "@/lib/onchain/rule-view";
import { useNetwork } from "@/hooks/use-network";
import type { ContextRule } from "@/lib/types";

/**
 * A real, already-deployed smart account — re-read from chain on every
 * visit (no local cache of its rules; only its id/label is bookmarked in
 * localStorage by onchain-accounts-store.ts), against whichever network is
 * selected in the app header.
 */
export function OnchainAccountPage({ id }: { id: string }) {
  const { network } = useNetwork();
  const [rules, setRules] = useState<ContextRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnchainRuleViews(id, network)
      .then((r) => {
        if (!cancelled) setRules(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not read this account from chain.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, network]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Chests
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-pale">On-chain chest</h1>
          <p className="mt-1 font-mono text-xs text-mist">{shortAddr(id, 10, 4)}</p>
        </div>
        <Tag tone="ink">{network}</Tag>
      </div>

      {error && (
        <p className="mt-10 text-sm text-denied">
          {error} — confirm this address is a deployed Baradd smart account on testnet.
        </p>
      )}

      {!error && rules === null && <p className="mt-10 text-sm text-mist">Reading rules from chain…</p>}

      {rules && (
        <>
          <div className="mt-10">
            <GovernanceCard adminRule={rules.find((r) => r.kind === "Admin")} />
          </div>

          <div className="mt-10">
            <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Rules</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rules
                .filter((r) => r.kind === "Rule")
                .map((rule) => (
                  <RuleCard key={rule.id} accountId={id} rule={rule} />
                ))}
              <Link
                href={`/app/${id}/rules/new`}
                className="card-shadow flex items-center justify-center border-[3px] border-dashed border-line p-5 text-sm text-mist transition hover:border-mist hover:text-pale"
              >
                + Add rule
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
