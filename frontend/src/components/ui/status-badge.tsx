// Spec section 6: "Early prototype · testnet demo in progress". Neutral
// styling, always visible above the fold.
export function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs tracking-wide text-mist">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
      Early prototype · testnet demo in progress
    </span>
  );
}
