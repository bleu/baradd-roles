import { comparisonRows } from "@/content/comparison";

export function WhyNotAlternatives() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">Why not the alternatives</h2>
      <p className="mt-2 max-w-2xl text-mist">
        Each approach solves part of the problem. We found none that makes the entry/exit
        asymmetry easy for a treasury team — sourced and dated 2 November 2026; the search was
        broad, not exhaustive.
      </p>

      <div className="mt-8 space-y-4">
        {comparisonRows.map((row) => (
          <details key={row.approach} className="group rounded-2xl border border-line open:bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-pale">
              <span className="font-medium">{row.approach}</span>
              <span className="text-xs text-mist">{row.examples}</span>
            </summary>
            <div className="grid gap-3 px-4 pb-4 text-sm sm:grid-cols-2">
              <p>
                <span className="text-mist">Strength: </span>
                <span className="text-pale">{row.strength}</span>
              </p>
              <p>
                <span className="text-mist">Gap for entry vs. exit: </span>
                <span className="text-pale">{row.gap}</span>
              </p>
            </div>
            <p className="px-4 pb-4 text-xs text-mist">
              Source:{" "}
              <a
                href={row.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-line underline-offset-2 hover:text-pale"
              >
                {row.sourceLabel}
              </a>
              , as of November 2026.
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
