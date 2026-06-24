"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type PricingSectionProps = {
  t: (key: string) => string;
  isAuthenticated: boolean;
  registerHref: string;
};

const SPAM_PRICING_PLANS = [
  {
    titleKey: "spamLanding.pricingTrialTitle",
    priceKey: "spamLanding.pricingTrialPrice",
    descKey: "spamLanding.pricingTrialDesc",
    periodKey: "spamLanding.pricingTrialPeriod",
    featureKeys: [
      "spamLanding.pricingTrialFeature1",
      "spamLanding.pricingTrialFeature2",
      "spamLanding.pricingTrialFeature3",
    ],
    isPopular: false,
    isProfitable: false,
    href: "register",
  },
  {
    titleKey: "spamLanding.pricingPremiumTitle",
    priceKey: "spamLanding.pricingPremiumPrice",
    descKey: "spamLanding.pricingPremiumDesc",
    periodKey: "spamLanding.pricingPremiumPeriod",
    featureKeys: [
      "spamLanding.pricingPremiumFeature1",
      "spamLanding.pricingPremiumFeature2",
      "spamLanding.pricingPremiumFeature3",
    ],
    isPopular: true,
    isProfitable: false,
    href: "tariffs",
  },
  {
    titleKey: "spamLanding.pricingComboTitle",
    priceKey: "spamLanding.pricingComboPrice",
    descKey: "spamLanding.pricingComboDesc",
    periodKey: "spamLanding.pricingComboPeriod",
    featureKeys: [
      "spamLanding.pricingComboFeature1",
      "spamLanding.pricingComboFeature2",
      "spamLanding.pricingComboFeature3",
      "spamLanding.pricingComboFeature4",
    ],
    isPopular: false,
    isProfitable: true,
    href: "tariffs",
    badgeKey: "spamLanding.pricingComboBadge",
  },
];

export default function PricingSection({
  t,
  isAuthenticated,
  registerHref,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="pricing-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "900px",
        paddingBottom: "2.5rem",
      }}
    >
      <Reveal
        className="pricing-header mx-auto mb-16 max-w-[1200px] text-center"
        direction="up"
      >
        <Reveal
          as="span"
          className="why-choose-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
        >
          {t("spamLanding.pricingTag")}
        </Reveal>
        <Reveal
          as="h2"
          className="why-choose-title m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          delay={90}
        >
          {t("spamLanding.pricingTitle")}
        </Reveal>
      </Reveal>

      <div className="pricing-grid mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-3">
        {SPAM_PRICING_PLANS.map((plan, idx) => (
          <Reveal
            key={idx}
            className={`pricing-card flex flex-col rounded-[24px] border p-10 transition duration-200 hover:-translate-y-1.5 ${
              plan.isPopular
                ? "border-transparent bg-[linear-gradient(145deg,#0A192F_0%,#1f366c_100%)] text-white shadow-[0_20px_40px_rgba(10,25,47,0.2)] hover:shadow-[0_24px_48px_rgba(10,25,47,0.28)]"
                : plan.isProfitable
                  ? "border-[#2530D9] bg-[linear-gradient(150deg,#f4f6ff_0%,#ffffff_55%,#eef1ff_100%)] text-[#0A192F] shadow-[0_20px_48px_rgba(37,48,217,0.16),0_0_0_1px_rgba(37,48,217,0.12)] hover:shadow-[0_28px_56px_rgba(37,48,217,0.24),0_0_0_1px_rgba(37,48,217,0.2)]"
                  : "border-[rgba(10,25,47,0.08)] bg-white text-[#0A192F] hover:border-[rgba(37,48,217,0.15)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"
            }`}
            direction={plan.isPopular ? "zoom" : "up"}
            delay={120 + idx * 95}
            style={plan.isProfitable ? { borderWidth: "2px" } : {}}
          >
            {plan.badgeKey && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[linear-gradient(135deg,#2530D9_0%,#4f5be8_100%)] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(37,48,217,0.45)]">
                {t(plan.badgeKey)}
              </span>
            )}
            <h3
              className={`m-0 mb-2 text-[1.3rem] font-bold ${
                plan.isPopular ? "text-white" : "text-[#0A192F]"
              }`}
            >
              {t(plan.titleKey)}
            </h3>
            <p
              className={`pricing-card-desc mb-6 text-[0.95rem] leading-[1.5] ${
                plan.isPopular ? "text-white/80" : "text-[#4A5568]"
              }`}
            >
              {t(plan.descKey)}
            </p>
            <div className="pricing-price-wrap mb-8 flex items-baseline gap-1">
              <span
                className={`pricing-price text-[2rem] sm:text-[3rem] font-extrabold leading-none ${
                  plan.isPopular
                    ? "text-white"
                    : plan.isProfitable
                      ? "text-[#2530D9]"
                      : "text-[#0A192F]"
                }`}
              >
                {t(plan.priceKey)}
              </span>
              <span
                className={`pricing-period text-[0.95rem] font-semibold ${
                  plan.isPopular ? "text-white/70" : "text-[#4A5568]"
                }`}
              >
                {t(plan.periodKey)}
              </span>
            </div>
            <ul className="pricing-features mb-8 flex flex-1 list-none flex-col gap-3 p-0">
              {plan.featureKeys.map((featureKey) => (
                <li
                  key={featureKey}
                  className={`flex items-center gap-3 text-[0.95rem] font-medium ${
                    plan.isPopular ? "text-white/90" : "text-[#4A5568]"
                  }`}
                >
                  <i
                    className={
                      plan.isPopular ? "text-[#ff3d71]" : "text-[#2530D9]"
                    }
                  >
                    <Check size={16} />
                  </i>
                  <span>{t(featureKey)}</span>
                </li>
              ))}
            </ul>
            <Link
              href={
                isAuthenticated
                  ? plan.href === "tariffs"
                    ? (process.env.NEXT_PUBLIC_IS_SPAM_APP === "true" ? "/tariffs" : "/spam/tariffs")
                    : (process.env.NEXT_PUBLIC_IS_SPAM_APP === "true" ? "/dashboard" : "/spam/dashboard")
                  : registerHref
              }
              className={`inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-2 px-7 text-[0.98rem] font-bold tracking-[0.01em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                plan.isPopular
                  ? "border-[#0A192F] bg-[#0A192F] text-white shadow-[0_10px_20px_rgba(10,25,47,0.12)] hover:border-[#1f366c] hover:bg-[#1f366c] hover:shadow-[0_14px_26px_rgba(10,25,47,0.18)]"
                  : plan.isProfitable
                    ? "border-[#2530D9] bg-[linear-gradient(135deg,#2530D9_0%,#4f5be8_100%)] text-white shadow-[0_10px_24px_rgba(37,48,217,0.32)] hover:shadow-[0_14px_32px_rgba(37,48,217,0.42)]"
                    : "border-[#0A192F] bg-transparent text-[#0A192F] hover:bg-[rgba(10,25,47,0.06)] hover:shadow-[0_8px_16px_rgba(10,25,47,0.1)]"
              }`}
            >
              {isAuthenticated
                ? plan.href === "tariffs"
                  ? t("spam.referralsAndTariffs")
                  : t("common.dashboard")
                : t("landing.pricingBtn")}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
