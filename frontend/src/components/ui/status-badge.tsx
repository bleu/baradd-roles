// Spec section 6: "Early prototype · testnet demo in progress". Neutral
// styling, always visible above the fold.
export function StatusBadge() {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 font-mono text-xs font-bold uppercase"
      style={{ background: "var(--obsidian)", color: "var(--surface)" }}
    >
      Early prototype · testnet demo in progress
    </span>
  );
}
