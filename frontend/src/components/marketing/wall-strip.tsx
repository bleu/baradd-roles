import { KeyholeRow, ThresholdBlock } from "@/components/ui/keyhole";

const WALL = [
  { box: "BOX 01", title: "Exit to the chest", required: 1, total: 3 },
  { box: "BOX 02", title: "Enter a new position", required: 2, total: 3 },
  { box: "BOX 03", title: "Change the rules", required: 3, total: 5 },
] as const;

/** The "deposit wall" strip — three rules at a glance, right under the hero. */
export function WallStrip() {
  return (
    <section className="on-ink" aria-label="Three rules at a glance">
      <div className="mx-auto grid max-w-[1240px] gap-6 px-6 py-14 sm:grid-cols-3 lg:px-10">
        {WALL.map((w) => (
          <div key={w.box} className="card-shadow-accent flex items-stretch border-[3px] border-surface bg-surface">
            <div className="flex flex-1 flex-col gap-2.5 p-5 text-obsidian">
              <span className="font-mono text-xs font-bold text-mist">{w.box}</span>
              <span className="font-display text-xl leading-[1.05] uppercase">{w.title}</span>
              <KeyholeRow total={w.total} required={w.required} size={20} />
            </div>
            <ThresholdBlock required={w.required} label={w.required === 1 ? "key" : "keys"} />
          </div>
        ))}
      </div>
    </section>
  );
}
