// Spec section 6, microcopy for status: "Demo data. No live chest is
// connected." Section 13 acceptance checklist requires it on every screen
// of the wallet UI. "Deposit Wall" styling: a quiet black strip with an
// orange dot — the one banner tier, never alarming.
export function DemoBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2.5 px-6 py-2 text-center font-mono text-xs"
      style={{ background: "var(--obsidian)", color: "var(--surface)" }}
    >
      <span aria-hidden className="inline-block h-2 w-2" style={{ background: "var(--gold)" }} />
      Demo data. No live chest is connected.
    </div>
  );
}
