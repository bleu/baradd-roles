import { audienceCards } from "@/content/audience";

export function Audience() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-ink">Who it&apos;s for</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {audienceCards.map((card) => (
          <div key={card.title} className="rounded-sm border border-line p-5">
            <h3 className="font-display text-xl text-ink">{card.title}</h3>
            <p className="mt-3 text-sm text-stone">{card.situation}</p>
            <p className="mt-3 border-l-2 border-lamp pl-3 text-sm text-ink">{card.rule}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
