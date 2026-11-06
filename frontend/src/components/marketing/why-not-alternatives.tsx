import { comparisonRows } from "@/content/comparison";

export function WhyNotAlternatives() {
  return (
    <section className="mx-auto max-w-[1240px] border-t-[3px] border-line px-6 py-16 sm:py-24 lg:px-10">
      <div className="flex max-w-3xl flex-col gap-4">
        <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">Why not the alternatives</span>
        <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">
          Where Baradd sits among the options.
        </h2>
        <p className="m-0 text-mist">
          Each approach solves part of the problem. We found none that makes the entry/exit asymmetry easy for a
          treasury team — sourced and dated 2 November 2026; the search was broad, not exhaustive.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto pr-1.5 pb-1.5">
        <div className="card-shadow min-w-[760px] border-[3px] border-line">
          <div className="on-ink grid grid-cols-[1.1fr_1.5fr_1.5fr_0.6fr] gap-6 border-b-[3px] border-line px-6 py-3.5">
            <span className="font-mono text-xs font-bold tracking-wide uppercase">Alternative</span>
            <span className="font-mono text-xs font-bold tracking-wide uppercase">Strength</span>
            <span className="font-mono text-xs font-bold tracking-wide uppercase">Gap for entry vs. exit</span>
            <span className="font-mono text-xs font-bold tracking-wide uppercase">Source</span>
          </div>
          {comparisonRows.map((row) => (
            <div
              key={row.approach}
              className="grid grid-cols-[1.1fr_1.5fr_1.5fr_0.6fr] items-start gap-6 border-b-[3px] border-line px-6 py-5 last:border-b-0"
            >
              <div className="flex flex-col gap-1">
                <span className="font-display text-base leading-tight text-pale uppercase">{row.approach}</span>
                <span className="text-xs text-mist">{row.examples}</span>
              </div>
              <span className="text-sm text-mist">{row.strength}</span>
              <span className="text-sm text-pale">{row.gap}</span>
              <a
                href={row.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs font-bold text-pale underline decoration-line underline-offset-4 hover:opacity-70"
              >
                {row.sourceLabel} ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
