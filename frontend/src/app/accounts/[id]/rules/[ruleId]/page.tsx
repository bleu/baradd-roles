import { notFound } from "next/navigation";
import Link from "next/link";
import { findAccount, findRule } from "@/lib/mock-data";
import { RuleKindBadge } from "@/components/rule-kind-badge";
import { SignerList } from "@/components/signer-list";
import { PolicyView } from "@/components/policy-view";
import { RuleActions } from "@/components/rule-actions";

export default async function RulePage({
  params,
}: {
  params: Promise<{ id: string; ruleId: string }>;
}) {
  const { id, ruleId } = await params;
  const account = findAccount(id);
  const rule = findRule(id, Number(ruleId));
  if (!account || !rule) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href={`/accounts/${id}`} className="text-xs text-muted transition hover:text-foreground">
        ← {account.label}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl text-foreground">{rule.name}</h1>
        <RuleKindBadge kind={rule.kind} />
      </div>

      <section className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-muted uppercase">
          Signers · {rule.threshold} of {rule.signers.length} required
        </h2>
        <div className="mt-3">
          <SignerList signers={rule.signers} threshold={rule.threshold} />
        </div>
      </section>

      {rule.config ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.2em] text-muted uppercase">
            RolesPolicy · {rule.config.mode === "Exit" ? "exit" : "entry"} mode
          </h2>
          <p className="mt-2 text-sm text-muted">
            Deny-by-default: any contract, function, or argument not listed below is rejected.
          </p>
          <div className="mt-3">
            <PolicyView config={rule.config} />
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-sm border border-border bg-surface p-4 text-sm text-muted">
          This is the Admin rule — it has no RolesPolicy attached. Its signers can change rules and
          install or remove policies on the other rules.
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-muted uppercase">Tooling</h2>
        <div className="mt-3">
          <RuleActions />
        </div>
      </section>
    </div>
  );
}
