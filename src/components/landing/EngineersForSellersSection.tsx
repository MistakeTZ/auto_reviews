"use client";

import { Terminal, Shield, Cpu, RefreshCw } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useAppStore } from "@/store/useAppStore";

type EngineersForSellersSectionProps = {
  t: (key: string) => string;
};

export default function EngineersForSellersSection({
  t,
}: EngineersForSellersSectionProps) {
  const language = useAppStore((state) => state.language);

  return (
    <section className="engineers-section relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 text-[#0A192F]">
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Left column: Text descriptions */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <Reveal
            as="span"
            className="eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          >
            {language === "ru"
              ? "НАДЕЖНОСТЬ И СТАБИЛЬНОСТЬ"
              : "RELIABILITY & STABILITY"}
          </Reveal>
          <Reveal
            as="h2"
            className="m-0 mb-4 mx-auto max-w-[20ch] text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F] lg:mx-0"
          >
            {t("landing.engineersSectionTitle")}
          </Reveal>
          <Reveal
            as="p"
            className="mx-auto max-w-[50ch] text-[1.02rem] leading-[1.65] text-[#4A5568] lg:mx-0"
          >
            {t("landing.engineersSectionSubtitle")}
          </Reveal>

          <div className="grid gap-6 pt-4 text-left sm:grid-cols-2">
            <Reveal
              className="rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-8 transition duration-200 hover:-translate-y-1.5 hover:border-[rgba(37,48,217,0.15)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"
              direction="up"
              delay={120}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                <Shield size={20} />
              </div>
              <h4 className="mb-2 text-[1.1rem] font-bold text-[#0A192F]">
                {t("landing.engineersCard1Title")}
              </h4>
              <p className="m-0 text-[0.9rem] leading-[1.65] text-[#4A5568]">
                {t("landing.engineersCard1Desc")}
              </p>
            </Reveal>

            <Reveal
              className="rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-8 transition duration-200 hover:-translate-y-1.5 hover:border-[rgba(37,48,217,0.15)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"
              direction="up"
              delay={200}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                <Cpu size={20} />
              </div>
              <h4 className="mb-2 text-[1.1rem] font-bold text-[#0A192F]">
                {t("landing.engineersCard2Title")}
              </h4>
              <p className="m-0 text-[0.9rem] leading-[1.65] text-[#4A5568]">
                {t("landing.engineersCard2Desc")}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Right column: Terminal matching the "Pro" pricing card style */}
        <div className="w-full max-w-[540px] flex-1 hidden lg:block">
          <Reveal
            className="rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-4 shadow-[0_20px_40px_rgba(10,25,47,0.1)]"
            direction="right"
            delay={180}
          >
            <div className="overflow-hidden rounded-[18px] border border-slate-800 bg-slate-950 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-white/40" />
                  <span className="text-[11px] font-bold text-white/60 font-mono tracking-wide">
                    wb-api-monitor.sh
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              <div className="max-h-[280px] space-y-2 overflow-hidden p-5 font-mono text-[11.5px] leading-relaxed text-white/70 select-none">
                <div className="flex items-center gap-2 text-white/40">
                  <span>$</span>
                  <span>./wb-monitor --watch --verbose</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#6480e6]">
                  <RefreshCw size={10} className="animate-spin" />
                  <span>[MONITOR] Connecting to Wildberries OpenAPI...</span>
                </div>
                <div className="text-white/50">
                  <span>
                    [INFO] Watching documentation feeds: content, feedbacks
                  </span>
                </div>
                <div className="font-bold text-[#34D399]">
                  <span>
                    [OK] System synchronized. Schema matches production.
                  </span>
                </div>
                <div className="text-white/20">
                  <span>------------------------------------------------</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-[#ffbd2e]">
                  <span>●</span>
                  <span>[API ALERT] Schema modification detected</span>
                </div>
                <div className="pl-3 text-white/50">
                  <span>&gt; endpoint: /api/v1/feedbacks/archive</span>
                </div>
                <div className="pl-3 text-white/50">
                  <span>&gt; delta: query param limit (50 -&gt; 100)</span>
                </div>
                <div className="font-bold text-[#6480e6]">
                  <span>[HOTFIX] Re-generating boundary validators...</span>
                </div>
                <div className="font-bold text-[#34D399]">
                  <span>[DEPLOYED] Sync complete. 0ms downtime.</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
