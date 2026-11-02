import Link from "next/link";
import type { ContextRule } from "@/lib/types";
import { RuleKindBadge } from "@/components/rule-kind-badge";
import { shortAddr } from "@/lib/format";

export function RuleCard({ accountId, rule }: { accountId: string; rule: ContextRule }) {
  const targetCount = rule.config?.targets.length ?? 0;
  const fnCount = rule.config?.targets.reduce((n, t) => n + t.fns.length, 0) ?? 0;

  return (
    <Link
      href={`/app/${accountId}/rules/${rule.id}`}
      className="group block rounded-sm border border-line bg-surface p-5 transition hover:border-stone"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink">{rule.name}</h3>
          {rule.protocolLabel && <p className="text-xs text-stone">{rule.protocolLabel}</p>}
        </div>
        <RuleKindBadge kind={rule.kind} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-stone">Threshold</dt>
        <dd className="text-right text-ink">
          {rule.threshold} of {rule.signers.length}
        </dd>

        <dt className="text-stone">Signers</dt>
        <dd className="text-right text-ink">
          {rule.signers.slice(0, 2).map((s) => s.label ?? shortAddr(s.address)).join(", ")}
          {rule.signers.length > 2 ? ` +${rule.signers.length - 2}` : ""}
        </dd>

        {rule.config && (
          <>
            <dt className="text-stone">Policy</dt>
            <dd className="text-right text-ink">
              {targetCount} contract{targetCount === 1 ? "" : "s"}, {fnCount} function
              {fnCount === 1 ? "" : "s"}
            </dd>
          </>
        )}
      </dl>

      <span className="mt-4 inline-block text-xs text-stone transition group-hover:text-ink">
        View rule →
      </span>
    </Link>
  );
}
