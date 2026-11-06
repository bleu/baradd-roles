import Link from "next/link";
import { RuleKindBadge } from "@/components/rule-kind-badge";
import { ThresholdBlock } from "@/components/ui/keyhole";
import type { ContextRule } from "@/lib/types";

/** Breadcrumb + title + the orange "easiest path" threshold panel, shared across the example/draft/on-chain rule detail pages. */
export function RuleHeader({
  backHref,
  backLabel,
  rule,
}: {
  backHref: string;
  backLabel: string;
  rule: ContextRule;
}) {
  const easiest = Math.min(...rule.roleGroups.map((g) => g.threshold));

  return (
    <>
      <Link href={backHref} className="text-xs text-mist transition hover:text-pale">
        ← {backLabel}
      </Link>
      <div className="card-shadow mt-4 flex items-stretch border-[3px] border-line bg-surface">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl text-pale">{rule.name}</h1>
            <RuleKindBadge kind={rule.kind} />
          </div>
        </div>
        {Number.isFinite(easiest) && (
          <ThresholdBlock required={easiest} label={`${easiest === 1 ? "key" : "keys"} on easiest path`} />
        )}
      </div>
    </>
  );
}
