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
    <section className="engineers-section relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 text-[#0A192F] lg:px-8 lg:py-20">
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
        
        {/* Left column: Text descriptions */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <Reveal
            as="span"
            className="eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c] is-revealed"
          >
            {language === "ru" ? "НАДЕЖНОСТЬ И СТАБИЛЬНОСТЬ" : "RELIABILITY & STABILITY"}
          </Reveal>
          <Reveal
            as="h2"
            className="m-0 mb-4 mx-auto max-w-[20ch] text-[clamp(1.8rem,3.4vw,2.75rem)] font-black leading-[1.15] tracking-tight text-[#0A192F] lg:mx-0"
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
              className="rounded-[20px] border border-[rgba(10,25,47,0.08)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_18px_36px_rgba(10,25,47,0.08)]"
              direction="up"
              delay={120}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                <Shield size={20} />
              </div>
              <h4 className="mb-2 text-[1rem] font-bold text-[#0A192F]">
                {t("landing.engineersCard1Title")}
              </h4>
              <p className="m-0 text-[0.9rem] leading-[1.65] text-[#4A5568]">
                {t("landing.engineersCard1Desc")}
              </p>
            </Reveal>

            <Reveal
              className="rounded-[20px] border border-[rgba(10,25,47,0.08)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_18px_36px_rgba(10,25,47,0.08)]"
              direction="up"
              delay={200}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                <Cpu size={20} />
              </div>
              <h4 className="mb-2 text-[1rem] font-bold text-[#0A192F]">
                {t("landing.engineersCard2Title")}
              </h4>
              <p className="m-0 text-[0.9rem] leading-[1.65] text-[#4A5568]">
                {t("landing.engineersCard2Desc")}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="w-full max-w-[540px] flex-1">
          <Reveal
            className="rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-4 shadow-[0_20px_40px_rgba(10,25,47,0.1)]"
            direction="right"
            delay={180}
          >
            <div className="overflow-hidden rounded-[18px] border border-slate-800 bg-slate-950 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-300 font-mono">wb-api-monitor.sh</span>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              </div>
              <div className="max-h-[260px] space-y-2 overflow-hidden p-5 font-mono text-[11px] leading-relaxed text-slate-300 select-none">
                <div className="flex items-center gap-2 text-slate-500">
                  <span>$</span>
                  <span>./wb-monitor --watch --verbose</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <RefreshCw size={10} className="animate-spin" />
                  <span>[MONITOR] Connecting to Wildberries OpenAPI Gateway...</span>
                </div>
                <div className="text-slate-400">
                  <span>[INFO] Watching documentation feeds: content, feedbacks, questions</span>
                </div>
                <div className="font-bold text-emerald-400">
                  <span>[OK] System synchronized. Schema matches production.</span>
                </div>
                <div className="text-slate-500">
                  <span>---------------------------------------------------------</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <span>●</span>
                  <span>[API ALERT] Schema modification detected on feedbacks endpoint</span>
                </div>
                <div className="pl-3 text-slate-300">
                  <span>&gt; endpoint: /api/v1/feedbacks/archive</span>
                </div>
                <div className="pl-3 text-slate-300">
                  <span>&gt; delta: query param limit (max value updated 50 -&gt; 100)</span>
                </div>
                <div className="font-bold text-indigo-300">
                  <span>[HOTFIX] Re-generating boundary validators dynamically...</span>
                </div>
                <div className="font-bold text-emerald-400">
                  <span>[DEPLOYED] Sync complete. 0ms downtime. System updated.</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
