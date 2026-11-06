import type { RuleKind } from "@/lib/types";

// Reserve green and red for approval results; distinguish rule kinds by text.
const LABELS: Record<RuleKind, string> = {
  Admin: "Admin",
  Rule: "Rule",
};

export function RuleKindBadge({ kind }: { kind: RuleKind }) {
  return (
    <span className="inline-flex items-center rounded-2xl border-[3px] border-line px-2 py-0.5 text-xs tracking-wide text-pale">
      {LABELS[kind]}
    </span>
  );
}
