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
          className="group relative flex flex-col items-center md:items-start text-center md:text-left bg-[linear-gradient(150deg,#ffffff_0%,#f9fafb_55%,#f3f4f6_100%)] border border-[rgba(71,85,105,0.1)] p-8 rounded-[24px] shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.15)] hover:border-[rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-1"
          delay={120}
        >
          <div className="w-14 h-14 rounded-[16px] bg-[linear-gradient(135deg,#818cf8_0%,#6366f1_100%)] text-white font-extrabold flex items-center justify-center text-lg mb-6 shadow-[0_8px_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_28px_rgba(99,102,241,0.4)] transition-all duration-300">
            1
          </div>
          <h3 className="text-[1.05rem] font-bold text-slate-900 mb-3">
            {t("spamLanding.howStep1Title")}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed m-0 font-medium">
            {t("spamLanding.howStep1Desc")}
          </p>
        </Reveal>

        {/* Step 2 */}
        <Reveal
          className="group relative flex flex-col items-center md:items-start text-center md:text-left bg-[linear-gradient(150deg,#ffffff_0%,#f9fafb_55%,#f3f4f6_100%)] border border-[rgba(71,85,105,0.1)] p-8 rounded-[24px] shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.15)] hover:border-[rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-1"
          delay={180}
        >
          <div className="w-14 h-14 rounded-[16px] bg-[linear-gradient(135deg,#818cf8_0%,#6366f1_100%)] text-white font-extrabold flex items-center justify-center text-lg mb-6 shadow-[0_8px_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_28px_rgba(99,102,241,0.4)] transition-all duration-300">
            2
          </div>
          <h3 className="text-[1.05rem] font-bold text-slate-900 mb-3">
            {t("spamLanding.howStep2Title")}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed m-0 font-medium">
            {t("spamLanding.howStep2Desc")}
          </p>
        </Reveal>

        {/* Step 3 */}
        <Reveal
          className="group relative flex flex-col items-center md:items-start text-center md:text-left bg-[linear-gradient(150deg,#ffffff_0%,#f9fafb_55%,#f3f4f6_100%)] border border-[rgba(71,85,105,0.1)] p-8 rounded-[24px] shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.15)] hover:border-[rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-1"
          delay={240}
        >
          <div className="w-14 h-14 rounded-[16px] bg-[linear-gradient(135deg,#818cf8_0%,#6366f1_100%)] text-white font-extrabold flex items-center justify-center text-lg mb-6 shadow-[0_8px_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_28px_rgba(99,102,241,0.4)] transition-all duration-300">
            3
          </div>
          <h3 className="text-[1.05rem] font-bold text-slate-900 mb-3">
            {t("spamLanding.howStep3Title")}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed m-0 font-medium">
            {t("spamLanding.howStep3Desc")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
