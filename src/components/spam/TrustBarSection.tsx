"use client";

import Reveal from "@/components/ui/Reveal";
import { useSpamLandingStats } from "@/hooks/useSpamLandingStats";

type TrustBarSectionProps = {
  t: (key: string) => string;
  language: string;
};

export default function TrustBarSection({ t, language }: TrustBarSectionProps) {
  const totalMessages = useSpamLandingStats();

  const stat1Value =
    totalMessages === null
      ? t("spamLanding.trustSent")
      : new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US").format(
          totalMessages,
        );

  return (
    <section className="trust-bar-section border-y border-[#E2E8F0] bg-white py-10">
      <div className="trust-bar-container mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-4 px-4 md:flex-row md:gap-6 lg:px-6">
        <Reveal
          className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568] flex-1"
          delay={90}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
              {stat1Value}
            </strong>
            <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,0.2)] animate-pulse" />
          </div>
          <span className="text-sm font-semibold">{t("spamLanding.trustSentDesc")}</span>
        </Reveal>
        
        <div className="trust-divider hidden h-10 w-px bg-[#CBD5E0] md:block" />
        
        <Reveal
          className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568] flex-1"
          delay={170}
        >
          <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
            {t("spamLanding.trustNoBan")}
          </strong>
          <span className="text-sm font-semibold">{t("spamLanding.trustNoBanDesc")}</span>
        </Reveal>
        
        <div className="trust-divider hidden h-10 w-px bg-[#CBD5E0] md:block" />
        
        <Reveal
          className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568] flex-1"
          delay={250}
        >
          <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
            {t("spamLanding.trustUptime")}
          </strong>
          <span className="text-sm font-semibold">{t("spamLanding.trustUptimeDesc")}</span>
        </Reveal>
      </div>
    </section>
  );
}
