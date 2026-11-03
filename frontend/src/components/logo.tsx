/**
 * A three-spire silhouette on a solid base — restyled from the user's art
 * reference (2026-11-03). Pure brand mark, no doorway detail; that lives in
 * the hero graphic instead. Single color (currentColor) plus one gold
 * accent at the tallest spire's tip, like a lit beacon.
 */
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M6,28 L6,20 L8,20 L11,10 L13,16 L16,4 L19,16 L21,10 L24,20 L26,20 L26,28 Z"
        fill="currentColor"
      />
      <circle cx="16" cy="4" r="1.3" fill="var(--gold)" />
    </svg>
  );
}
