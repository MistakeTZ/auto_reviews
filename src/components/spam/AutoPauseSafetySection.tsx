"use client";

import Reveal from "@/components/ui/Reveal";
import { MessageSquare, RefreshCw, UserCheck } from "lucide-react";

type AutoPauseSafetySectionProps = {
  t: (key: string) => string;
};

export default function AutoPauseSafetySection({ t }: AutoPauseSafetySectionProps) {
  return (
    <section
      id="auto-pause"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 border-b border-slate-100"
    >
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Visual schematic diagram */}
        <div className="lg:col-span-6 lg:order-last">
          <Reveal
            className="bg-slate-50 border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-inner"
            direction="left"
            delay={200}
          >
            <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider text-center">
              {t("spamLanding.pauseVisualTitle")}
            </h4>

            {/* Sequence block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-sm relative group hover:border-indigo-200">
                <span className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 font-black">1</span>
                <span className="text-slate-800 font-bold mb-1">{t("spamLanding.pauseVisualStep1")}</span>
                <p className="text-slate-400 font-medium text-[10px]">Periodic campaign message triggers</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-sm relative group hover:border-indigo-200">
                <span className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 font-black">2</span>
                <span className="text-slate-800 font-bold mb-1">{t("spamLanding.pauseVisualStep2")}</span>
                <p className="text-slate-400 font-medium text-[10px]">Customer replies in Wildberries chat</p>
              </div>

              <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-sm relative group">
                <span className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2 font-black">3</span>
                <span className="text-rose-800 font-bold mb-1">{t("spamLanding.pauseVisualStep3")}</span>
                <p className="text-rose-500/80 font-medium text-[10px]">Rule is instantly PAUSED (Anti-Spam)</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-sm relative group">
                <span className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 font-black">4</span>
                <span className="text-emerald-800 font-bold mb-1">{t("spamLanding.pauseVisualStep4")}</span>
                <p className="text-emerald-600/80 font-medium text-[10px]">Alert sent to team in Telegram</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Narrative info */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <Reveal
              as="span"
              className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
              direction="up"
            >
              {t("spamLanding.pauseTag")}
            </Reveal>
            <Reveal
              as="h2"
              className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
              direction="up"
              delay={90}
            >
              {t("spamLanding.pauseTitle")}
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal className="flex gap-4 items-start" delay={120}>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <MessageSquare size={18} />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed m-0">
                {t("spamLanding.pauseDesc1")}
              </p>
            </Reveal>

            <Reveal className="flex gap-4 items-start" delay={180}>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <RefreshCw size={18} />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed m-0">
                {t("spamLanding.pauseDesc2")}
              </p>
            </Reveal>

            <Reveal className="flex gap-4 items-start" delay={240}>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <UserCheck size={18} />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed m-0">
                {t("spamLanding.pauseDesc3")}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
