/**
 * A crenellated tower silhouette with an arrow-slit window at its center —
 * a real defensive-architecture feature, vertically lens-shaped like a
 * watchful eye, with no Tolkien association (see docs/landing-page-spec.md,
 * section 9: no burning eye, no Mordor imagery). The doorway at its base
 * stays asymmetric — wide on the left (the exit), narrow on the right (the
 * entry) — carrying the product's core idea into the mark itself.
 */
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M6,29 L6,7 L11,7 L11,11 L13.5,11 L13.5,7 L18.5,7 L18.5,11 L21,11 L21,7 L26,7 L26,29 Z"
        fill="currentColor"
      />
      {/* arrow-slit window, a watchful eye by shape */}
      <path d="M16,13 Q18.3,17 16,21 Q13.7,17 16,13 Z" fill="var(--paper)" />
      <circle cx="16" cy="17" r="1.1" fill="var(--lamp)" />
      {/* asymmetric doorway: wide exit (left), narrow entry (right) */}
      <rect x="8" y="23" width="5" height="6" fill="var(--paper)" />
      <rect x="21" y="25" width="2" height="4" fill="var(--paper)" />
    </svg>
  );
}
