export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M16 1.5 30.5 16 16 30.5 1.5 16Z"
        stroke="var(--gold)"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M11 22V13l2.5-3.5L16 13l2.5-3.5L21 13v9"
        stroke="var(--gold)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 22h10" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
