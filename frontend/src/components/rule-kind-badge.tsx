import type { RuleKind } from "@/lib/types";

// Deliberately uncolored: the spec reserves Approved/Denied green/red for
// the demo's result states, and Lamp is the one brand accent, not a
// category-color system. The label text carries the distinction.
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
