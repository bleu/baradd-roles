import { notFound } from "next/navigation";
import Link from "next/link";
import { StrKey } from "@stellar/stellar-sdk";
import { findAccount, findRule } from "@/lib/mock-data";
import { isDraftId } from "@/lib/accounts-store";
import { RuleKindBadge } from "@/components/rule-kind-badge";
import { RoleGroupsView } from "@/components/role-groups-view";
import { PolicyView } from "@/components/policy-view";
import { RuleActions } from "@/components/rule-actions";
import { DraftRulePage } from "@/components/wallet/draft-rule-page";
import { OnchainRulePage } from "@/components/wallet/onchain-rule-page";

export default async function RulePage({
  params,
}: {
  params: Promise<{ id: string; ruleId: string }>;
}) {
  const { id, ruleId } = await params;

  // Draft rules only exist in the browser's localStorage, not on the
  // server, so they're resolved client-side instead of via findRule().
  if (isDraftId(id)) return <DraftRulePage accountId={id} ruleId={Number(ruleId)} />;

  const account = findAccount(id);
  const rule = findRule(id, Number(ruleId));
  if (!account && StrKey.isValidContract(id)) {
    return <OnchainRulePage key={`${id}-${ruleId}`} accountId={id} ruleId={Number(ruleId)} />;
  }
  if (!account || !rule) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href={`/app/${id}`} className="text-xs text-mist transition hover:text-pale">
        ← {account.label}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl text-pale">{rule.name}</h1>
        <RuleKindBadge kind={rule.kind} />
      </div>

      <section className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Signers</h2>
        <div className="mt-3">
          <RoleGroupsView roleGroups={rule.roleGroups} />
        </div>
      </section>

      {rule.target ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.2em] text-mist uppercase">RolesPolicy</h2>
          <p className="mt-2 text-sm text-mist">
            Deny-by-default: any contract, function, or argument not listed below is rejected.
          </p>
          <div className="mt-3">
            <PolicyView target={rule.target} />
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-2xl border-[3px] border-line bg-surface p-4 text-sm text-mist">
          This is the Admin rule — it has no RolesPolicy attached. Its signers can change rules and
          install or remove policies on the other rules.
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Tooling</h2>
        <div className="mt-3">
          <RuleActions />
        </div>
      </section>
    </div>
  );
}
