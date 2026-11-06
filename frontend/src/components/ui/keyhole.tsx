// The signature visual device of the "Deposit Wall" design: a rule's
// signature threshold is drawn as a row of deposit-box keyholes, not a
// progress bar. "required" = filled black, orange keyhole — one of the
// signatures the threshold demands. "spare" = outlined, steel keyhole — a
// signer who exists on the group but isn't needed to reach the threshold.
// "signed" = orange box, black keyhole — used only where a signer has
// actually signed in an interactive context (e.g. the marketing demo).
export type KeyholeState = "required" | "spare" | "signed";

export function Keyhole({ state, size = 22 }: { state: KeyholeState; size?: number }) {
  const box =
    state === "required" ? "var(--obsidian)" : state === "signed" ? "var(--gold)" : "none";
  const dot = state === "required" ? "var(--gold)" : state === "signed" ? "var(--obsidian)" : "var(--mist)";
  return (
    <svg width={size} height={Math.round((size * 30) / 22)} viewBox="0 0 22 30" aria-hidden="true">
      <rect x="1" y="1" width="20" height="28" style={{ fill: box, stroke: "var(--obsidian)", strokeWidth: 2 }} />
      <circle cx="11" cy="11" r="4.2" style={{ fill: dot }} />
      <path d="M9 14 H13 L14.5 22 H7.5 Z" style={{ fill: dot }} />
    </svg>
  );
}

/** A threshold drawn as `required` of `total` filled keyholes — the rest shown as spare. */
export function KeyholeRow({
  total,
  required,
  size = 22,
  className = "",
}: {
  total: number;
  required: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-1.5 ${className}`}>
      {Array.from({ length: total }, (_, i) => (
        <Keyhole key={i} state={i < required ? "required" : "spare"} size={size} />
      ))}
    </span>
  );
}

/** Same row, but driven by which specific signers have signed (interactive contexts, e.g. the demo). */
export function KeyholeSignedRow({
  states,
  size = 22,
  className = "",
}: {
  states: KeyholeState[];
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-1.5 ${className}`}>
      {states.map((state, i) => (
        <Keyhole key={i} state={state} size={size} />
      ))}
    </span>
  );
}

/** The big orange side panel showing the threshold number — "2" / "KEYS". */
export function ThresholdBlock({ required, label }: { required: number; label: string }) {
  return (
    <div
      className="flex flex-none flex-col items-center justify-center gap-0.5 border-l-[3px] border-obsidian px-5 py-3"
      style={{ background: "var(--gold)", color: "var(--obsidian)" }}
    >
      <span className="text-5xl leading-[0.85] font-extrabold tracking-tighter">{required}</span>
      <span className="font-mono text-[10px] font-bold tracking-wide uppercase">{label}</span>
    </div>
  );
}
