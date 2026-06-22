"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

type FAQSectionProps = {
  t: (key: string) => string;
};

export default function FAQSection({ t }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [1, 2, 3].map((num) => {
    return {
      q: t(`landing.faq${num}Q`),
      a: t(`landing.faq${num}A`),
    };
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="pricing-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "900px",
        paddingBottom: "5rem",
        paddingTop: "5rem",
      }}
    >
      <div className="mx-auto mb-12 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("landing.faqTitle") || "FAQ"}
        </Reveal>
        <Reveal
          as="h2"
          className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={90}
        >
          {t("landing.faqTitle") || "Частые вопросы"}
        </Reveal>
      </div>

      <div className="max-w-[800px] mx-auto px-4 space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <Reveal
              key={index}
              className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white hover:bg-slate-50 transition-colors duration-200"
              direction="up"
              delay={120 + index * 50}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left p-5 text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-indigo-600 shrink-0" />
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-slate-500 text-sm font-semibold leading-relaxed border-t border-slate-100 bg-slate-50/10">
                  <p className="m-0 pt-4">{item.a}</p>
                </div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
