import { audienceCards } from "@/content/audience";
import { KeyholeRow } from "@/components/ui/keyhole";

export function Audience() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
      <div className="flex max-w-3xl flex-col gap-4">
        <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">Who it is for</span>
        <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">
          Teams with money that must move at different speeds.
        </h2>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {audienceCards.map((card) => (
          <article key={card.title} className="card-shadow flex flex-col gap-4 border-[3px] border-line bg-surface p-7">
            <h3 className="font-display text-2xl leading-none text-pale">{card.title}</h3>
            <p className="m-0 text-mist">{card.situation}</p>
            <div className="flex flex-col gap-2.5 border-t-[3px] border-line pt-[18px]">
              <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">Example rule</span>
              <span className="font-bold text-pale">{card.rule}</span>
              <div className="flex items-center gap-3.5">
                <KeyholeRow total={card.total} required={card.required} size={20} />
                <span className="font-mono text-sm font-bold text-pale">{card.holesText}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
