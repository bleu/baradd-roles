import { TerminalBlock } from "@/components/ui/terminal-block";
import { Tag } from "@/components/ui/tag";
import { lintOutput, toolStatus } from "@/content/tooling";

export function Tooling() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
      <div className="flex max-w-3xl flex-col gap-4">
        <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">Tooling</span>
        <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">
          A command line that checks your rules.
        </h2>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
        <TerminalBlock command={lintOutput.command} output={lintOutput.output} />

        <div className="card-shadow border-[3px] border-line bg-surface px-7 py-2">
          {toolStatus.map((t) => (
            <div
              key={t.command}
              className="flex items-center justify-between gap-3 border-t-[3px] border-line py-[18px]"
            >
              <span className={`font-mono text-sm font-bold ${t.works ? "text-pale" : "text-mist"}`}>
                {t.command}
              </span>
              <Tag tone={t.works ? "ok" : "dashed"}>{t.works ? "Works today" : "Not yet"}</Tag>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
