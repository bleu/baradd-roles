export function Closing() {
  return (
    <section id="cta" className="on-ink">
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 px-6 py-24 text-center sm:py-32">
        <h2 className="font-display text-[clamp(2.9rem,7vw,6.25rem)] leading-[0.9] text-surface">
          Leave with one key. <span className="text-gold">Enter with many.</span>
        </h2>
        <p className="m-0 text-xl text-[#c9c6be]">The demo is live on testnet. Nothing here touches real funds.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#demo"
            className="border-[3px] border-surface bg-gold px-6 py-3 text-sm font-extrabold tracking-wide text-obsidian uppercase shadow-[6px_6px_0_var(--surface)] transition hover:opacity-90"
          >
            Try to move the chest
          </a>
          <a
            href="https://github.com/bleu/baradd-roles/blob/master/docs/spec.md"
            target="_blank"
            rel="noreferrer"
            className="border-[3px] border-surface px-6 py-3 text-sm font-extrabold tracking-wide text-surface uppercase transition hover:opacity-70"
          >
            Follow the build
          </a>
        </div>
      </div>
    </section>
  );
}
