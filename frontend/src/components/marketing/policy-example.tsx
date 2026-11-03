import { exampleToml, examplePlainLanguage } from "@/content/policy-example";

export function PolicyExample() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">What a policy looks like</h2>
      <p className="mt-2 max-w-2xl text-mist">
        Real example from <code className="text-pale">examples/defindex-exit.toml</code> in the
        repository. Addresses are placeholders — they stay visibly placeholders.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <pre className="overflow-x-auto rounded-sm border border-line bg-obsidian p-4 font-mono text-xs leading-relaxed text-pale">
          <code>{exampleToml}</code>
        </pre>
        <div className="rounded-sm border border-line p-5">
          <p className="text-xs tracking-[0.15em] text-mist uppercase">In plain language</p>
          <ul className="mt-3 space-y-3 text-sm text-pale">
            {examplePlainLanguage.map((line, i) => (
              <li key={i} className="border-l-2 border-gold pl-3">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
