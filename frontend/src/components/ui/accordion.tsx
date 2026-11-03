"use client";

import { useState } from "react";

export interface AccordionItem {
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const open = openIndex === i;
        const panelId = `accordion-panel-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-lg text-pale"
              >
                {item.question}
                <span aria-hidden className="shrink-0 text-mist">
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>
            {open && (
              <div id={panelId} className="pb-4 text-sm text-mist">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
