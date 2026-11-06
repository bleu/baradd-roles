import type { ReactNode } from "react";

export type TagTone = "default" | "ink" | "gold" | "dashed" | "ok" | "bad";

const TONE_STYLE: Record<TagTone, React.CSSProperties> = {
  default: {},
  ink: { background: "var(--obsidian)", color: "var(--surface)" },
  gold: { background: "var(--gold)", borderColor: "var(--obsidian)" },
  dashed: { borderStyle: "dashed", color: "var(--mist)" },
  ok: { color: "var(--approved)", borderColor: "var(--approved)" },
  bad: { color: "var(--denied)", borderColor: "var(--denied)" },
};

/** A small bordered pill — "Deposit Wall" `.tag`: Testnet, Draft, Real, Demo data, Approved/Denied, etc. */
export function Tag({ tone = "default", children }: { tone?: TagTone; children: ReactNode }) {
  return (
    <span
      className="inline-flex min-h-[26px] items-center gap-1.5 border-2 border-obsidian px-2 font-mono text-[11px] font-bold tracking-wide uppercase"
      style={{ background: "var(--surface)", color: "var(--obsidian)", ...TONE_STYLE[tone] }}
    >
      {children}
    </span>
  );
}
