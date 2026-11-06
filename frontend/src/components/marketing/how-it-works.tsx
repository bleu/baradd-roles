const HOW: { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Rules",
    body: "A rule names a contract, the functions on it, and who may call them. Each rule has its own signer groups and thresholds.",
  },
  {
    num: "02",
    title: "Scope",
    body: "Arguments can be pinned down too: a fixed value, one of a set, a numeric range, or this account's own address.",
  },
  {
    num: "03",
    title: "Deny by default",
    body: "Anything not explicitly listed is rejected. There is no catch-all path to forget about.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
      <div className="flex max-w-3xl flex-col gap-4">
        <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">How it works</span>
        <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">
          Rules, scope, and a closed door by default.
        </h2>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {HOW.map((h) => (
          <article key={h.num} className="card-shadow flex flex-col gap-4 border-[3px] border-line bg-surface p-7">
            <span className="w-fit border-2 border-obsidian bg-gold px-2.5 py-0.5 font-mono text-sm font-bold">
              {h.num}
            </span>
            <h3 className="font-display text-2xl leading-none text-pale">{h.title}</h3>
            <p className="m-0 text-mist">{h.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
