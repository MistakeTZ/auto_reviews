"use client";

import Reveal from "@/components/ui/Reveal";

type HowItWorksSectionProps = {
  t: (key: string) => string;
};

export default function HowItWorksSection({ t }: HowItWorksSectionProps) {
  return (
    <section
      id="how-it-works"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 border-b border-slate-100"
    >
      <div className="mx-auto mb-16 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("spamLanding.howTag")}
        </Reveal>
        <Reveal
          as="h2"
          className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={90}
        >
          {t("spamLanding.howTitle")}
        </Reveal>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Step 1 */}
        <Reveal
          className="flex flex-col items-center md:items-start text-center md:text-left bg-slate-50/50 border border-slate-100 p-6 rounded-3xl hover:shadow-md hover:border-slate-200 transition-all duration-300"
          delay={120}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center text-lg mb-5 shadow-sm">
            1
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            {t("spamLanding.howStep1Title")}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed m-0">
            {t("spamLanding.howStep1Desc")}
          </p>
        </Reveal>

        {/* Step 2 */}
        <Reveal
          className="flex flex-col items-center md:items-start text-center md:text-left bg-slate-50/50 border border-slate-100 p-6 rounded-3xl hover:shadow-md hover:border-slate-200 transition-all duration-300"
          delay={180}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center text-lg mb-5 shadow-sm">
            2
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            {t("spamLanding.howStep2Title")}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed m-0">
            {t("spamLanding.howStep2Desc")}
          </p>
        </Reveal>

        {/* Step 3 */}
        <Reveal
          className="flex flex-col items-center md:items-start text-center md:text-left bg-slate-50/50 border border-slate-100 p-6 rounded-3xl hover:shadow-md hover:border-slate-200 transition-all duration-300"
          delay={240}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center text-lg mb-5 shadow-sm">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            {t("spamLanding.howStep3Title")}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed m-0">
            {t("spamLanding.howStep3Desc")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
