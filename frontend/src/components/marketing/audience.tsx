import { audienceCards } from "@/content/audience";

export function Audience() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">Who it&apos;s for</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {audienceCards.map((card) => (
          <div key={card.title} className="card-shadow rounded-2xl border-[3px] border-line bg-surface p-5">
            <h3 className="font-display text-xl text-pale">{card.title}</h3>
            <p className="mt-3 text-sm text-mist">{card.situation}</p>
            <p className="mt-3 border-l-2 border-gold pl-3 text-sm text-pale">{card.rule}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
