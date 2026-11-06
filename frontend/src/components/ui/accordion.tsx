"use client";

import { useState } from "react";

export interface AccordionItem {
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y-[3px] divide-line border-[3px] border-line">
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
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg text-pale"
              >
                {item.question}
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full font-mono text-sm font-bold"
                  style={{ background: "var(--gold)", color: "var(--obsidian)" }}
                >
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>
            {open && (
              <div id={panelId} className="px-5 pb-4 text-sm text-mist">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
