// Keep the numeric label visible so the result does not depend on color.
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
            className={`h-2 flex-1 rounded-2xl ${filled ? color : "bg-line"}`}
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
