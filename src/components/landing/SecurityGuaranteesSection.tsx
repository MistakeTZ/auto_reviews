"use client";

import { ShieldCheck, Zap, Settings } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type SecurityGuaranteesSectionProps = {
  t: (key: string) => string;
};

const SECURITY_FEATURES = [
  {
    icon: ShieldCheck,
    titleKey: "landing.securityFeature1Title",
    descKey: "landing.securityFeature1Desc",
  },
  {
    icon: Zap,
    titleKey: "landing.securityFeature2Title",
    descKey: "landing.securityFeature2Desc",
  },
  {
    icon: Settings,
    titleKey: "landing.securityFeature3Title",
    descKey: "landing.securityFeature3Desc",
  },
];

export default function SecurityGuaranteesSection({
  t,
}: SecurityGuaranteesSectionProps) {
  return (
    <section className="security-guarantees-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20">
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <Reveal className="text-center mb-16" direction="up">
          <span className="eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]">
            {t("landing.security")}
          </span>
          <h2 className="text-[clamp(1.8rem,3.4vw,2.75rem)] font-black leading-[1.15] tracking-tight text-[#0A192F] m-0 max-w-[28ch] mx-auto">
            {t("landing.securityTitle")}
          </h2>
        </Reveal>

        {/* Security Cards Grid */}
        <div className="security-grid mx-auto grid max-w-[1200px] gap-7 md:grid-cols-2 xl:grid-cols-3">
          {SECURITY_FEATURES.map((security, idx) => {
            const Icon = security.icon;
            return (
              <Reveal
                key={idx}
                className="security-card flex flex-col rounded-[20px] border border-[rgba(10,25,47,0.08)] bg-white p-9 transition duration-200 hover:-translate-y-1.5 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_18px_36px_rgba(10,25,47,0.1)]"
                direction="zoom"
                delay={120 + idx * 90}
              >
                <div className="security-card-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                  <Icon size={28} />
                </div>
                <h3 className="security-card-title mb-3 text-[1.2rem] font-bold leading-[1.3] text-[#0A192F]">
                  {t(security.titleKey)}
                </h3>
                <p className="security-card-description m-0 text-[0.95rem] leading-[1.65] text-[#4A5568]">
                  {t(security.descKey)}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
