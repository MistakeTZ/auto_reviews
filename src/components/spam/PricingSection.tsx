"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type PricingSectionProps = {
  t: (key: string) => string;
  isAuthenticated: boolean;
  registerHref: string;
};

export default function PricingSection({
  t,
  isAuthenticated,
  registerHref,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 border-b border-slate-100"
    >
      <div className="mx-auto mb-16 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("spamLanding.pricingTag")}
        </Reveal>
        <Reveal
          as="h2"
          className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={90}
        >
          {t("spamLanding.pricingTitle")}
        </Reveal>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: Free Trial */}
        <Reveal
          className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 relative"
          delay={120}
        >
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              {t("spamLanding.pricingTrialTitle")}
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              {t("spamLanding.pricingTrialDesc")}
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black text-slate-900">
                {t("spamLanding.pricingTrialPrice")}
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase">
                {t("spamLanding.pricingTrialPeriod")}
              </span>
            </div>
            
            <ul className="space-y-3.5 pl-0 m-0 list-none text-xs font-semibold text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{t("spamLanding.pricingTrialFeature1")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{t("spamLanding.pricingTrialFeature2")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{t("spamLanding.pricingTrialFeature3")}</span>
              </li>
            </ul>
          </div>

          <Link
            href={isAuthenticated ? "/spam/dashboard" : registerHref}
            className="mt-8 btn-secondary inline-flex min-h-[3rem] items-center justify-center rounded-xl border-2 border-slate-800 bg-transparent px-5 text-sm font-bold text-slate-800 transition duration-200 hover:bg-slate-50 cursor-pointer"
          >
            {isAuthenticated ? t("common.dashboard") : t("landing.getStarted") || "Start Free"}
          </Link>
        </Reveal>

        {/* Tier 2: Standing Premium */}
        <Reveal
          className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 relative"
          delay={180}
        >
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              {t("spamLanding.pricingPremiumTitle")}
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              {t("spamLanding.pricingPremiumDesc")}
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black text-slate-900">
                {t("spamLanding.pricingPremiumPrice")}
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase">
                {t("spamLanding.pricingPremiumPeriod")}
              </span>
            </div>
            
            <ul className="space-y-3.5 pl-0 m-0 list-none text-xs font-semibold text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{t("spamLanding.pricingPremiumFeature1")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{t("spamLanding.pricingPremiumFeature2")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{t("spamLanding.pricingPremiumFeature3")}</span>
              </li>
            </ul>
          </div>

          <Link
            href={isAuthenticated ? "/spam/tariffs" : registerHref}
            className="mt-8 btn-primary inline-flex min-h-[3rem] items-center justify-center rounded-xl border-2 border-[#0A192F] bg-[#0A192F] px-5 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-[#1f366c] hover:border-[#1f366c] cursor-pointer"
          >
            {isAuthenticated ? t("spam.referralsAndTariffs") || "Buy" : t("landing.getStarted") || "Start Now"}
          </Link>
        </Reveal>

        {/* Tier 3: Combo Pack (Recommended) */}
        <Reveal
          className="bg-white border-2 border-indigo-600 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col justify-between relative"
          delay={240}
        >
          {/* Best value badge */}
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1.5 rounded-full shadow-md">
            <Sparkles size={11} /> {t("spamLanding.pricingComboBadge") || "COMBO"}
          </span>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1 mt-1">
              {t("spamLanding.pricingComboTitle")}
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              {t("spamLanding.pricingComboDesc")}
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t("spamLanding.pricingComboPrice")}
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase">
                {t("spamLanding.pricingComboPeriod")}
              </span>
            </div>
            
            <ul className="space-y-3.5 pl-0 m-0 list-none text-xs font-semibold text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-indigo-600 shrink-0 animate-pulse" />
                <span className="text-slate-900 font-bold">{t("spamLanding.pricingComboFeature1")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-indigo-600 shrink-0" />
                <span>{t("spamLanding.pricingComboFeature2")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-indigo-600 shrink-0" />
                <span>{t("spamLanding.pricingComboFeature3")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-indigo-600 shrink-0" />
                <span>{t("spamLanding.pricingComboFeature4")}</span>
              </li>
            </ul>
          </div>

          <Link
            href={isAuthenticated ? "/spam/tariffs" : registerHref}
            className="mt-8 btn-primary inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-indigo-600 text-white px-5 text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition duration-200 cursor-pointer"
          >
            {isAuthenticated ? t("spam.referralsAndTariffs") || "Buy" : t("landing.getStarted") || "Start Combo"}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
