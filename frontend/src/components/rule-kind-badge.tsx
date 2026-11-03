import type { RuleKind } from "@/lib/types";

// Deliberately uncolored: the spec reserves Approved/Denied green/red for
// the demo's result states, and Lamp is the one brand accent, not a
// three-way category system. The label text carries the distinction.
const LABELS: Record<RuleKind, string> = {
  Admin: "Admin",
  Exit: "Exit · 1 signature",
  Entry: "Entry · more signatures",
};

export function RuleKindBadge({ kind }: { kind: RuleKind }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-line px-2 py-0.5 text-xs tracking-wide text-pale">
      {LABELS[kind]}
    </span>
  );
}
