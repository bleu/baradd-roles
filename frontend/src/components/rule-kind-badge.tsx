import type { RuleKind } from "@/lib/types";

const STYLES: Record<RuleKind, string> = {
  Admin: "border-rust-dim text-rust bg-rust-dim/10",
  Exit: "border-sage-dim text-sage bg-sage-dim/10",
  Entry: "border-gold-dim text-gold bg-gold-dim/10",
};

const LABELS: Record<RuleKind, string> = {
  Admin: "Admin",
  Exit: "Exit · 1 signature",
  Entry: "Entry · more signatures",
};

export function RuleKindBadge({ kind }: { kind: RuleKind }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs tracking-wide ${STYLES[kind]}`}
    >
      {LABELS[kind]}
    </span>
  );
}
