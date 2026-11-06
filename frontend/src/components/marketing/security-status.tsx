import { statusRows, honestLimit } from "@/content/status";

export function SecurityStatus() {
  return (
    <section id="security-and-status" className="on-ink">
      <div className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="font-mono text-xs font-bold tracking-wide text-gold uppercase">Security and status</span>
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-surface">
            What is real today.
          </h2>
          <p className="m-0 text-[#c9c6be]">Stated plainly. Dashed means not yet.</p>
        </div>

        <div className="mt-10 overflow-x-auto pr-1.5 pb-1.5">
          <div className="card-shadow-accent min-w-[760px] border-[3px] border-surface">
            <div className="grid grid-cols-[1.4fr_2fr] gap-4 border-b-[3px] border-surface px-6 py-3.5">
              <span className="font-mono text-xs font-bold tracking-wide text-surface uppercase">Component</span>
              <span className="font-mono text-xs font-bold tracking-wide text-surface uppercase">State today</span>
            </div>
            {statusRows.map((row) => (
              <div
                key={row.component}
                className="grid grid-cols-[1.4fr_2fr] items-start gap-4 border-b-[3px] border-surface px-6 py-5 last:border-b-0"
              >
                <span className="font-mono text-xs text-surface">{row.component}</span>
                <span className="text-sm text-[#c9c6be]">{row.pageMayAsSay}</span>
              </div>
            ))}
          </div>
        </div>

        <div role="note" className="mt-8 flex max-w-[900px] items-stretch border-[3px] border-surface">
          <span className="flex flex-none items-center border-r-[3px] border-surface bg-gold px-4 font-mono text-xs font-bold text-obsidian">
            LIMIT
          </span>
          <p className="m-0 px-5 py-3.5 text-[17px] text-surface">{honestLimit}</p>
        </div>

        <div className="mt-6 grid gap-2 text-sm text-[#c9c6be] sm:grid-cols-3">
          <p className="m-0">
            <span className="text-surface">Audit: </span>planned, not started.
          </p>
          <p className="m-0">
            <span className="text-surface">License: </span>MIT.
          </p>
          <p className="m-0">
            <a
              href="https://github.com/bleu/baradd-roles/blob/master/docs/validations.md"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[#45423c] underline-offset-2 hover:text-surface"
            >
              Specification and validations log
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
