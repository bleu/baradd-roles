import { roadmap } from "@/content/roadmap";
import { Tag } from "@/components/ui/tag";

const ITEMS = [
  ...roadmap.done.map((text) => ({ text, tone: "ok" as const, label: "Done" })),
  ...roadmap.next.map((text) => ({ text, tone: "dashed" as const, label: "Next" })),
  ...roadmap.later.map((text) => ({ text, tone: "dashed" as const, label: "Later" })),
];

export function Roadmap() {
  return (
    <section className="mx-auto max-w-[1240px] border-t-[3px] border-line px-6 py-16 sm:py-24 lg:px-10">
      <div className="flex max-w-3xl flex-col gap-4">
        <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">Roadmap</span>
        <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">Planned, not built.</h2>
      </div>
      <ol className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <li key={i} className="flex flex-col gap-3 border-t-[12px] border-line pt-[18px]">
            <Tag tone={item.tone}>{item.label}</Tag>
            <p className="m-0 font-display text-lg leading-tight text-pale">{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
