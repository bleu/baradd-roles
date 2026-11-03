import { roadmap } from "@/content/roadmap";

const COLUMNS = [
  { key: "done", label: "Done", items: roadmap.done },
  { key: "next", label: "Next", items: roadmap.next },
  { key: "later", label: "Later", items: roadmap.later },
] as const;

export function Roadmap() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">Roadmap</h2>
      <p className="mt-2 text-sm text-mist">No dates. &ldquo;Planned&rdquo; only.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <h3 className="text-xs tracking-[0.15em] text-mist uppercase">{col.label}</h3>
            <ul className="mt-3 space-y-2">
              {col.items.map((item) => (
                <li key={item} className="border-l-2 border-line pl-3 text-sm text-pale">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
