"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type HeroSectionProps = {
  t: (key: string) => string;
  isAuthenticated: boolean;
  registerHref: string;
};

export default function HeroSection({
  t,
  isAuthenticated,
  registerHref,
}: HeroSectionProps) {
  return (
    <section className="hero-section overflow-hidden bg-[#F7FAFC] px-4 py-12 lg:px-8">
      <div className="hero-container mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:gap-16">
        <div className="hero-content flex flex-1 flex-col items-center lg:items-start">
          <Reveal
            as="span"
            className="eyebrow mb-4 inline-flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-[2px] text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-3 py-1.5 rounded-full"
            delay={120}
          >
            <Sparkles size={14} className="text-indigo-600" />
            {t("spamLanding.heroTag")}
          </Reveal>
          <Reveal
            as="h2"
            className="hero-headline mb-6 max-w-[22ch] text-[clamp(2rem,4.7vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-1px] text-[#0A192F]"
            delay={180}
          >
            {t("spamLanding.heroTitlePrefix")}
            <span className="relative inline-block bg-gradient-to-r from-indigo-600 to-purple-600 bg-[length:220%_220%] bg-clip-text text-transparent">
              {t("spamLanding.heroTitleHighlight")}
            </span>
            {t("spamLanding.heroTitleSuffix")}
          </Reveal>

          <Reveal
            as="p"
            className="hero-subheadline mb-10 max-w-[90%] text-[clamp(1rem,1.8vw,1.125rem)] leading-[1.6] text-[#4A5568] lg:max-w-none"
            delay={260}
          >
            {t("spamLanding.heroSubtitle")}
          </Reveal>

          <Reveal
            className="hero-buttons flex w-full flex-col gap-5 items-center lg:items-start xl:flex-row"
            delay={340}
          >
            <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
              <Link
                href={isAuthenticated ? "/spam/dashboard" : registerHref}
                className="btn-primary inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-2 border-[#0A192F] bg-[#0A192F] px-7 text-[0.98rem] font-bold tracking-[0.01em] text-white shadow-[0_10px_20px_rgba(10,25,47,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-[#1f366c] hover:bg-[#1f366c] hover:shadow-[0_14px_26px_rgba(10,25,47,0.18)] active:translate-y-0 active:shadow-none shrink-0 cursor-pointer"
              >
                {isAuthenticated
                  ? t("common.dashboard")
                  : t("spamLanding.heroCtaStart")}
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <a
                href="#scheduling"
                className="btn-secondary inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-2 border-[#0A192F] bg-transparent px-7 text-[0.98rem] font-bold tracking-[0.01em] text-[#0A192F] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(10,25,47,0.06)] hover:shadow-[0_8px_16px_rgba(10,25,47,0.1)] active:translate-y-0 active:shadow-none shrink-0 cursor-pointer"
              >
                {t("spamLanding.heroCtaDemo")}
              </a>
            </div>
          </Reveal>

          <Reveal
            as="p"
            className="mt-6 text-center text-sm font-medium text-[#4A5568] lg:text-left"
            delay={420}
          >
            {t("spamLanding.heroBottomLine")}
          </Reveal>
        </div>

        <Reveal
          className="hero-visual flex flex-1 justify-center lg:justify-end"
          direction="right"
          delay={220}
        >
          <div className="image-container w-full max-w-[550px] overflow-hidden rounded-[24px] shadow-[0_20px_40px_rgba(10,25,47,0.08)]">
            <picture>
              <source media="(max-width: 769px)" srcSet="/spam_sm.webp" />
              <source media="(min-width: 770px)" srcSet="/spam_md.webp" />
              <img
                src="/spam_md.webp"
                alt={t("spamLanding.heroImageAlt")}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </picture>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
