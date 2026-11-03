// A segmented bar showing counted-of-required, per spec section 9
// ("Components to build"). Color is never the only signal — the numeric
// label is always shown alongside.
export function SignatureMeter({
  counted,
  required,
  approved,
}: {
  counted: number;
  required: number;
  approved: boolean;
}) {
  const segments = Array.from({ length: Math.max(required, counted) }, (_, i) => i < counted);
  const color = approved ? "bg-approved" : "bg-denied";

  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`${counted} of ${required} required signatures`}>
        {segments.map((filled, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-sm ${filled ? color : "bg-line"}`}
            aria-hidden
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-mist">
        {counted} of {required} required
      </p>
    </div>
  );
}
