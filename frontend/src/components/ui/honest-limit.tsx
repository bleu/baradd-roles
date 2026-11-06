// Use this callout for security limits and features that are not built yet.
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
