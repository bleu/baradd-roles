import { Accordion } from "@/components/ui/accordion";
import { faqItems } from "@/content/faq";

export function Faq() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">Frequently asked</h2>
      <div className="mt-8">
        <Accordion items={faqItems} />
      </div>
    </section>
  );
}
