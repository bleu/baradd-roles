import Link from "next/link";
import type { ContextRule } from "@/lib/types";
import { RuleKindBadge } from "@/components/rule-kind-badge";
import { shortAddr } from "@/lib/format";

export function RuleCard({ accountId, rule }: { accountId: string; rule: ContextRule }) {
  const targetCount = rule.config?.targets.length ?? 0;
  const fnCount = rule.config?.targets.reduce((n, t) => n + t.fns.length, 0) ?? 0;

  return (
    <Link
      href={`/accounts/${accountId}/rules/${rule.id}`}
      className="group block rounded-sm border border-border bg-surface p-5 transition hover:border-border-strong hover:bg-surface-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-foreground">{rule.name}</h3>
          {rule.protocolLabel && <p className="text-xs text-muted">{rule.protocolLabel}</p>}
        </div>
        <RuleKindBadge kind={rule.kind} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-dim">Threshold</dt>
        <dd className="text-right text-foreground">
          {rule.threshold} of {rule.signers.length}
        </dd>

        <dt className="text-muted-dim">Signers</dt>
        <dd className="text-right text-foreground">
          {rule.signers.slice(0, 2).map((s) => s.label ?? shortAddr(s.address)).join(", ")}
          {rule.signers.length > 2 ? ` +${rule.signers.length - 2}` : ""}
        </dd>

        {rule.config && (
          <>
            <dt className="text-muted-dim">Policy</dt>
            <dd className="text-right text-foreground">
              {targetCount} contract{targetCount === 1 ? "" : "s"}, {fnCount} function
              {fnCount === 1 ? "" : "s"}
            </dd>
          </>
        )}
      </dl>

      <span className="mt-4 inline-block text-xs text-muted transition group-hover:text-gold">
        View rule →
      </span>
    </Link>
  );
}
