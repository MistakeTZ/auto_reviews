"use client";

import { Zap, Settings, ShieldCheck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type FeaturesSectionProps = {
  t: (key: string) => string;
};

const FEATURES = [
  {
    icon: Zap,
    titleKey: "landing.feature1Title",
    descKey: "landing.feature1Desc",
  },
  {
    icon: Settings,
    titleKey: "landing.feature2Title",
    descKey: "landing.feature2Desc",
  },
  {
    icon: ShieldCheck,
    titleKey: "landing.feature3Title",
    descKey: "landing.feature3Desc",
  },
];

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section
      className="services-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{ contentVisibility: "auto", containIntrinsicSize: "840px" }}
    >
      <Reveal
        className="services-header mx-auto mb-14 max-w-[1200px] text-center"
        direction="up"
      >
        <span className="services-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.8px] text-[#1f366c]">
          {t("landing.capabilities")}
        </span>
        <h2 className="services-title m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]">
          {t("landing.feature1Title")
            ? t("landing.ourPowerfulFeatures")
            : t("landing.features")}
        </h2>
      </Reveal>
      <div className="services-grid mx-auto grid max-w-[1200px] gap-7 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Reveal
              key={idx}
              className="service-card flex flex-col rounded-[20px] border border-[rgba(10,25,47,0.08)] bg-white p-9 transition duration-200 hover:-translate-y-1.5 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_18px_36px_rgba(10,25,47,0.1)]"
              direction="zoom"
              delay={120 + idx * 90}
            >
              <div className="service-card-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                <Icon size={28} />
              </div>
              <h3 className="service-card-title mb-3 text-[1.2rem] font-bold leading-[1.3] text-[#0A192F]">
                {t(feature.titleKey)}
              </h3>
              <p className="service-card-description m-0 text-[0.95rem] leading-[1.65] text-[#4A5568]">
                {t(feature.descKey)}
              </p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
