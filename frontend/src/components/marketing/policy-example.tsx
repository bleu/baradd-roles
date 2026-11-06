import { exampleToml, examplePlainLanguage } from "@/content/policy-example";
import { CodeBlock } from "@/components/ui/code-block";

export function PolicyExample() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">What a policy looks like</h2>
      <p className="mt-2 max-w-2xl text-mist">
        Real example from <code className="text-pale">examples/exit-vault.toml</code> in the
        repository. Addresses are placeholders — they stay visibly placeholders.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <CodeBlock code={exampleToml} filename="exit-vault.toml" />
        <div className="border-[3px] border-obsidian bg-surface p-5">
          <p className="text-xs tracking-[0.15em] text-mist uppercase">In plain language</p>
          <ul className="mt-3 space-y-3 text-sm text-pale">
            {examplePlainLanguage.map((line, i) => (
              <li key={i} className="border-l-4 border-gold pl-3">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
