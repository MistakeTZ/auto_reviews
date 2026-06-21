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
        <div className="hero-content flex flex-1 flex-col items-center lg:items-start text-center lg:text-left">
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
          className="hero-visual flex flex-1 justify-center lg:justify-end w-full"
          direction="right"
          delay={220}
        >
          {/* A beautiful visual mockup of the spam dashboard and schedules */}
          <div className="image-container w-full max-w-[550px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-300 font-mono text-xs flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">reSpam Console v1.0</span>
            </div>

            {/* Mock Rule Block */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>RULE: Promo Coupon Mailing</span>
                <span className="text-emerald-500 font-semibold uppercase tracking-wider">● ACTIVE</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40 text-[11px] text-indigo-300 font-semibold">
                frequency: "Every 3 days" | hour: 14:00 (MCK)
              </div>
              <div className="text-slate-400 mt-1 italic text-[11px]">
                &ldquo;Hello [name]! Thanks for choosing our brand. Here is a 15% promo coupon: WBCOUPON15...&rdquo;
              </div>
            </div>

            {/* Timeline logs simulating the scheduling */}
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Activity Log</div>
              <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-3 py-2 rounded-xl">
                <span className="text-slate-400">14:00:00 — Triggered</span>
                <span className="text-slate-500 font-semibold">Waiting offset</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-3 py-2 rounded-xl">
                <span className="text-indigo-400">14:12:37 — Offset applied</span>
                <span className="text-indigo-500 font-semibold">+12m 37s</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-900/40 px-3 py-2 rounded-xl">
                <span className="text-emerald-400">14:12:38 — Sent to Buyer Anna</span>
                <span className="text-emerald-500 font-semibold">SUCCESS</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
