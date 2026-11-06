import Link from "next/link";
import type { ContextRule } from "@/lib/types";
import { RuleKindBadge } from "@/components/rule-kind-badge";
import { ROLE_LABELS } from "@/lib/role-labels";
import { KeyholeRow, ThresholdBlock } from "@/components/ui/keyhole";

export function RuleCard({ accountId, rule }: { accountId: string; rule: ContextRule }) {
  const fnCount = rule.target?.fns.length ?? 0;
  const easiest = Math.min(...rule.roleGroups.map((g) => g.threshold));

  return (
    <Link
      href={`/app/${accountId}/rules/${rule.id}`}
      className="card-shadow group flex items-stretch border-[3px] border-line bg-surface transition hover:border-mist"
    >
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-pale">{rule.name}</h3>
            {rule.target?.label && <p className="text-xs text-mist">{rule.target.label}</p>}
          </div>
          <RuleKindBadge kind={rule.kind} />
        </div>

        <div className="mt-4 space-y-1.5">
          {rule.roleGroups.map((group, i) => (
            <div key={group.role}>
              {i > 0 && (
                <p className="py-1 text-center font-mono text-[10px] font-bold tracking-wide text-mist uppercase">
                  or
                </p>
              )}
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-pale">
                  {group.threshold}/{group.signers.length} {ROLE_LABELS[group.role]}
                </span>
                <KeyholeRow total={group.signers.length} required={group.threshold} size={14} />
              </div>
            </div>
          ))}
        </div>

        {rule.target && (
          <p className="mt-4 text-xs text-mist">
            {fnCount} function{fnCount === 1 ? "" : "s"}
          </p>
        )}

        <span className="mt-4 inline-block text-xs text-mist transition group-hover:text-pale">
          Open rule →
        </span>
      </div>

      <ThresholdBlock required={easiest} label={easiest === 1 ? "key" : "keys"} />
    </Link>
  );
}
