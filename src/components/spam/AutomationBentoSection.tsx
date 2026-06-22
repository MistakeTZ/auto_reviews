"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";
import {
  Bell,
  Calendar,
  Clock,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Zap,
} from "lucide-react";

type AutomationBentoSectionProps = {
  t: (key: string) => string;
};

export default function AutomationBentoSection({
  t,
}: AutomationBentoSectionProps) {
  return (
    <section
      id="automation-stack"
      className="bg-gradient-to-b from-white to-slate-50/50 px-4 py-16 lg:px-8 lg:py-24 border-b border-slate-100/80 select-none"
    >
      {/* Section Header */}
      <div className="mx-auto mb-16 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="mb-3 inline-block text-[0.75rem] font-bold uppercase tracking-[0.15em] text-indigo-600/90 bg-indigo-50/60 px-3 py-1 rounded-full"
          direction="up"
        >
          {t("spamLanding.schedulingTag")}
        </Reveal>
        <Reveal
          as="h2"
          className="m-0 mt-2 text-[clamp(2rem,3.5vw,2.75rem)] font-black tracking-tight text-slate-900"
          direction="up"
          delay={90}
        >
          {t("spamLanding.schedulingTitle")}
        </Reveal>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max lg:auto-rows-[230px]">
        {/* BLOCK 1: Smart Scheduling (2x2 Main Driver) */}
        <Reveal
          className="group md:col-span-2 lg:row-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 lg:p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 relative flex flex-col justify-between overflow-hidden"
          direction="up"
          delay={120}
        >
          <div className="max-w-md z-10">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl inline-flex mb-5 shadow-sm ring-4 ring-indigo-50/50">
              <Calendar size={20} />
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {t("spamLanding.schedulingTitle")}
            </h3>
            <p className="text-slate-500 mt-2.5 text-sm leading-relaxed font-medium">
              {t("spamLanding.schedulingDesc1")}{" "}
              {t("spamLanding.schedulingDesc2")}
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 shadow-sm"
                style={{ maxWidth: "300px" }}
              >
                <Clock size={13} className="text-emerald-500 animate-pulse" />
                {t("spam.moscowHours")?.split(" (")[0] || "Moscow Time"}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 shadow-sm"
                style={{ maxWidth: "300px" }}
              >
                <ShieldCheck
                  size={13}
                  className="text-indigo-500"
                  style={{ minWidth: "16px" }}
                />
                {t("spam.timeRange")?.split(".")[0] || "Random Offset"}
              </span>
            </div>
          </div>

          {/* Visual UI Asset */}
          <div className="hidden lg:flex flex-col gap-3 absolute right-6 bottom-6 w-[42%] bg-slate-50/80 border border-slate-200/50 rounded-2xl p-4 text-xs shadow-inner backdrop-blur-sm transition-all duration-500 group-hover:bg-white group-hover:border-indigo-100 group-hover:shadow-md">
            <h4 className="m-0 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {t("spamLanding.schedulingTimelineTitle") || "Queue Stream"}
            </h4>
            <div className="space-y-2">
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-500 group-hover:border-indigo-100 group-hover:translate-x-1">
                <div className="mb-1 flex items-center justify-between font-bold text-[11px]">
                  <span className="text-indigo-600">
                    {t("spamLanding.schedulingTimelineItem1")}
                  </span>
                  <span className="font-mono text-slate-400">14:00</span>
                </div>
                <p className="m-0 text-[10px] font-semibold text-emerald-600/90">
                  {t("spamLanding.schedulingTimelineOffset")}: +12m 37s
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-500 group-hover:border-purple-100 group-hover:translate-x-1 delay-75">
                <div className="mb-1 flex items-center justify-between font-bold text-[11px]">
                  <span className="text-purple-600">
                    {t("spamLanding.schedulingTimelineItem2")}
                  </span>
                  <span className="font-mono text-slate-400">18:00</span>
                </div>
                <p className="m-0 text-[10px] font-semibold text-emerald-600/90">
                  {t("spamLanding.schedulingTimelineOffset")}: +4m 19s
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* BLOCK 2: Smart Pause System (1x2 Tall Sidebar) */}
        <Reveal
          className="group md:col-span-1 lg:row-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 lg:p-8 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-500 relative flex flex-col justify-between overflow-hidden"
          direction="up"
          delay={170}
        >
          <div className="z-10">
            <span className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl inline-flex mb-5 shadow-sm ring-4 ring-rose-50/50">
              <ShieldAlert size={20} />
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {t("spamLanding.pauseTitle")}
            </h3>
            <p className="text-slate-500 mt-2.5 text-sm leading-relaxed font-medium">
              {t("spamLanding.pauseDesc2")}
            </p>
          </div>

          {/* Visual UI Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-2 text-center text-[11px] font-bold mt-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:shadow-sm">
              <MessageSquare className="text-slate-400 mb-1.5" size={14} />
              <span className="text-slate-600 text-[10px] truncate w-full font-semibold">
                {t("spamLanding.pauseVisualStep1")}
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:shadow-sm">
              <RefreshCw className="text-slate-400 mb-1.5" size={14} />
              <span className="text-slate-600 text-[10px] truncate w-full font-semibold">
                {t("spamLanding.pauseVisualStep2")}
              </span>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 flex flex-col items-center justify-center text-rose-700 transition-all duration-500 group-hover:bg-rose-50/80 group-hover:shadow-sm">
              <ShieldAlert
                className="mb-1.5 text-rose-500 animate-bounce"
                size={14}
              />
              <span className="text-[10px] truncate w-full font-bold">
                {t("spamLanding.pauseVisualStep3")}
              </span>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 flex flex-col items-center justify-center text-emerald-700 transition-all duration-500 group-hover:bg-emerald-50/80 group-hover:shadow-sm">
              <UserCheck className="mb-1.5 text-emerald-500" size={14} />
              <span className="text-[10px] truncate w-full font-bold">
                {t("spamLanding.pauseVisualStep4")}
              </span>
            </div>
          </div>
        </Reveal>

        {/* BLOCK 3: Telegram Alerts (2x1 Contrast Anchor - Re-ordered logically for grid mapping) */}
        <Reveal
          className="group md:col-span-2 lg:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 lg:p-8 shadow-md hover:shadow-xl hover:border-sky-500/30 transition-all duration-500 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden"
          direction="up"
          delay={220}
        >
          <div className="max-w-md z-10">
            <h3 className="text-lg font-bold flex items-center gap-2.5">
              <span className="text-sky-400 p-1.5 bg-sky-500/10 rounded-xl">
                <Bell size={18} />
              </span>
              {t("spamLanding.alertsTitle")}
            </h3>
            <p className="text-slate-400 mt-2.5 text-xs leading-relaxed font-medium">
              {t("spamLanding.alertsDesc2")}
            </p>
          </div>

          {/* Premium Telegram Notification Asset */}
          <div className="hidden lg:flex bg-slate-900/90 text-white text-[11px] rounded-2xl p-3.5 shadow-xl items-center gap-3 shrink-0 w-[290px] border border-slate-800/80 backdrop-blur-sm transition-all duration-500 transform group-hover:scale-[1.03] group-hover:border-slate-700">
            <div className="w-8 h-8 bg-[#229ED9] rounded-full flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
              <Send
                size={13}
                className="fill-white text-white -translate-x-[1px] translate-y-[0.5px]"
              />
            </div>
            <div className="truncate flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-bold text-sky-400 text-[10px] tracking-wide">
                  Telegram Bot
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">
                  Just Now
                </span>
              </div>
              <span className="text-slate-300 block text-[11px] truncate font-medium">
                {t("spamLanding.alertsVisualAlert") ||
                  "Notification preview..."}
              </span>
            </div>
          </div>
        </Reveal>

        {/* BLOCK 4: Protection Engine (1x1 Accent Card) */}
        <Reveal
          className="group md:col-span-1 lg:col-span-1 bg-gradient-to-br from-amber-50/30 to-orange-50/10 border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
          direction="up"
          delay={250}
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <span className="text-amber-500 p-1.5 bg-amber-50 rounded-xl">
                <Zap size={16} className="fill-amber-500" />
              </span>
              {t("spamLanding.protectionTitle") || "Anti-Fingerprint"}
            </h3>
            <p className="text-slate-500 mt-2.5 text-xs leading-relaxed font-medium">
              {t("spamLanding.protectionDesc") ||
                "Dynamic system simulation ensuring native interactions."}
            </p>
          </div>

          {/* Hardened hardware metrics instead of loose text dividers */}
          <div className="hidden lg:flex flex-col gap-1.5 mt-4">
            <div className="flex justify-between items-center text-[10px] font-bold bg-white/80 border border-slate-100 rounded-xl px-2.5 py-1.5 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
              <span className="text-slate-400">CORE API</span>
              <span className="text-emerald-600">ОФИЦИАЛЬНЫЙ</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold bg-white/80 border border-slate-100 rounded-xl px-2.5 py-1.5 shadow-sm transition-transform duration-500 group-hover:scale-[1.02] delay-75">
              <span className="text-slate-400">RATE LIMITS</span>
              <span className="text-amber-600">СТРОГО В РАМКАХ</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
