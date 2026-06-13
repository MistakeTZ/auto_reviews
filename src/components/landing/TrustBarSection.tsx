"use client";

import Reveal from "@/components/ui/Reveal";
import { useLandingStats } from "@/hooks/useLandingStats";

type TrustBarSectionProps = {
  t: (key: string) => string;
  language: string;
};

export default function TrustBarSection({ t, language }: TrustBarSectionProps) {
  const totalAnswers = useLandingStats();

  const stat1Value =
    totalAnswers === null
      ? t("landing.stat1")
      : new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US").format(
          totalAnswers,
        );

  return (
    <section className="trust-bar-section border-y border-[#E2E8F0] bg-white py-10">
      <div className="trust-bar-container mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-4 px-4 md:flex-row md:gap-6 lg:px-6">
        <Reveal
          className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568]"
          delay={90}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
              {stat1Value}
            </strong>
            <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,0.2)] animate-pulse motion-reduce:animate-none" />
          </div>
          <span>{t("landing.stat1Desc")}</span>
        </Reveal>
        <div className="trust-divider hidden h-10 w-px bg-[#CBD5E0] md:block" />
        <Reveal
          className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568]"
          delay={170}
        >
          <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
            {t("landing.stat2")}
          </strong>
          <span>{t("landing.stat2Desc")}</span>
        </Reveal>
        <div className="trust-divider hidden h-10 w-px bg-[#CBD5E0] md:block" />
        <Reveal
          className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568]"
          delay={250}
        >
          <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
            {t("landing.stat3")}
          </strong>
          <span>{t("landing.stat3Desc")}</span>
        </Reveal>
      </div>
    </section>
  );
}
