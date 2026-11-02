import { TerminalBlock } from "@/components/ui/terminal-block";
import { lintOutput, diffOutput, comingTools } from "@/content/tooling";

export function Tooling() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-ink">Tooling</h2>
      <p className="mt-2 max-w-2xl text-stone">
        Real terminal output, run against the example files in this repository.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TerminalBlock command={lintOutput.command} output={lintOutput.output} />
        <TerminalBlock command={diffOutput.command} output={diffOutput.output} />
      </div>

      <div className="mt-8">
        <p className="text-xs tracking-[0.15em] text-stone uppercase">Coming</p>
        <ul className="mt-3 space-y-2">
          {comingTools.map((t) => (
            <li key={t.name} className="text-sm text-stone">
              <code className="text-ink">{t.name}</code> — needs {t.need}.
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
