// Spec section 9: an "Honest limit" callout used wherever a section states
// what is not done yet. Section 13 acceptance checklist requires it in the
// security section and next to every unfinished feature. "Deposit Wall"
// styling: a black-bordered strip with an orange "LIMIT" tab — the
// product's honesty, drawn the same way everywhere.
export function HonestLimit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-stretch border-[3px] border-obsidian bg-surface" role="note">
      <span
        className="flex flex-none items-center border-r-[3px] border-obsidian px-4 font-mono text-xs font-bold"
        style={{ background: "var(--gold)" }}
      >
        LIMIT
      </span>
      <p className="px-5 py-3.5 text-sm text-pale">{children}</p>
    </div>
  );
}
