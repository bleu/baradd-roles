import { exampleToml, examplePlainLanguage } from "@/content/policy-example";
import { CodeBlock } from "@/components/ui/code-block";

export function PolicyExample() {
  return (
    <section className="on-ink">
      <div className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="font-mono text-xs font-bold tracking-wide text-gold uppercase">Policy example</span>
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-surface">
            Real config, in plain words.
          </h2>
          <p className="m-0 max-w-2xl text-[#c9c6be]">
            Real example from <code className="text-surface">examples/exit-vault.toml</code> in the repository.
            Addresses are placeholders — they stay visibly placeholders.
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-2">
          <CodeBlock code={exampleToml} filename="exit-vault.toml" />
          <div className="card-shadow-accent flex flex-col gap-5 border-[3px] border-surface bg-surface p-7">
            <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">What this permits</span>
            <ul className="m-0 flex list-none flex-col gap-5 p-0 text-lg text-pale">
              {examplePlainLanguage.map((line, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="font-mono font-bold">→</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
