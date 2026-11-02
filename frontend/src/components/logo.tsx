/**
 * Square tower outline with an asymmetric doorway — wide at the base on the
 * left (the exit), a narrow slit on the right (the entry). Spec section 9:
 * "legible at 16px, works in one color." One stroke color, no fill.
 */
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" stroke="currentColor" strokeWidth="1.5" />
      {/* wide doorway, left: the exit */}
      <path d="M8 29V19h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* narrow slit, right: the entry */}
      <path d="M22 29v-6h2v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
