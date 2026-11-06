import { Accordion } from "@/components/ui/accordion";
import { faqItems } from "@/content/faq";

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[1240px] border-t-[3px] border-line px-6 py-16 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-[960px]">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">FAQ</span>
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">Straight answers.</h2>
        </div>
        <div className="mt-10">
          <Accordion items={faqItems} />
        </div>
      </div>
    </section>
  );
}
