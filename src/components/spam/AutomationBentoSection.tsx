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
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 border-b border-slate-100"
    >
      {/* Section Header */}
      <div className="mx-auto mb-12 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("spamLanding.schedulingTag")}
        </Reveal>
        <Reveal
          as="h2"
          className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={90}
        >
          {t("spamLanding.schedulingTitle")}
        </Reveal>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max lg:auto-rows-[240px]">
        {/* BLOCK 1: Smart Scheduling (2x2 - Top Left) */}
        <Reveal
          className="group md:col-span-2 lg:row-span-2 bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col justify-between"
          direction="up"
          delay={120}
        >
          <div className="max-w-xl z-10">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl inline-flex mb-4">
                <Calendar size={22} />
              </span>
              {t("spamLanding.schedulingTitle")}
            </h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              {t("spamLanding.schedulingDesc1")}{" "}
              {t("spamLanding.schedulingDesc2")}
            </p>

            {/* Inline Badges for extra context */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                <Clock size={13} className="text-emerald-500" />
                {t("spam.moscowHours")?.split(" (")[0] || "Moscow Time"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                <ShieldCheck size={13} className="text-amber-500" />
                {t("spam.timeRange")?.split(".")[0] || "Random Offset"}
              </span>
            </div>
          </div>

          {/* Visual: Premium Dynamic Timeline Scheduler */}
          <div className="hidden lg:flex mt-4 w-full lg:mt-0 lg:ml-auto lg:w-[45%] lg:absolute lg:right-6 lg:bottom-6 bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex-col gap-3 text-xs max-h-[190px] overflow-hidden">
            <h4 className="m-0 flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase text-slate-400">
              {t("spamLanding.schedulingTimelineTitle") || "Queue Stream"}
            </h4>
            <div className="space-y-2.5">
              <div className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mb-1 flex items-center justify-between font-bold text-[11px]">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
                    {t("spamLanding.schedulingTimelineItem1")}
                  </span>
                  <span className="font-mono text-slate-400">14:00 (MCK)</span>
                </div>
                <p className="m-0 text-[11px] font-medium text-emerald-600">
                  {t("spamLanding.schedulingTimelineOffset")}: +12m 37s
                </p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white p-3 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mb-1 flex items-center justify-between font-bold text-[11px]">
                  <span className="rounded bg-purple-50 px-2 py-0.5 text-purple-700">
                    {t("spamLanding.schedulingTimelineItem2")}
                  </span>
                  <span className="font-mono text-slate-400">18:00 (MCK)</span>
                </div>
                <p className="m-0 text-[11px] font-medium text-emerald-600">
                  {t("spamLanding.schedulingTimelineOffset")}: +4m 19s
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* BLOCK 2: Smart Pause System (1x2 Tall - Right Side) */}
        <Reveal
          className="group lg:col-span-1 md:col-span-2 lg:row-span-2 bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col justify-between"
          direction="up"
          delay={170}
        >
          <div className="z-10">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl inline-flex mb-4">
                <ShieldAlert size={22} />
              </span>
              {t("spamLanding.pauseTitle")}
            </h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              {t("spamLanding.pauseDesc2")}
            </p>
          </div>

          {/* Visual: Vertical Flow Steps */}
          <div className="hidden lg:grid grid-cols-2 gap-2 text-center text-[11px] font-bold mt-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
              <MessageSquare className="text-indigo-500 mb-1" size={14} />
              <span className="text-slate-700 truncate w-full">
                {t("spamLanding.pauseVisualStep1")}
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
              <RefreshCw className="text-indigo-500 mb-1" size={14} />
              <span className="text-slate-700 truncate w-full">
                {t("spamLanding.pauseVisualStep2")}
              </span>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-2.5 flex flex-col items-center justify-center text-rose-700 transition-transform duration-300 group-hover:scale-[1.02]">
              <ShieldAlert className="mb-1" size={14} />
              <span className="truncate w-full">
                {t("spamLanding.pauseVisualStep3")}
              </span>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 flex flex-col items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-[1.02]">
              <UserCheck className="mb-1" size={14} />
              <span className="truncate w-full">
                {t("spamLanding.pauseVisualStep4")}
              </span>
            </div>
          </div>
        </Reveal>

        {/* BLOCK 3: Telegram Alerts (2x1 Wide - Bottom Left) */}
        <Reveal
          className="group md:col-span-2 lg:col-span-2 lg:row-span-1 bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          direction="up"
          delay={220}
        >
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-sky-500">
                <Bell size={20} />
              </span>
              {t("spamLanding.alertsTitle")}
            </h3>
            <p className="text-slate-500 mt-1 text-xs leading-relaxed">
              {t("spamLanding.alertsDesc2")}
            </p>
          </div>

          {/* Visual: Interactive Telegram Push Mockup */}
          <div className="hidden lg:flex bg-slate-950 text-white text-[11px] rounded-2xl p-3.5 shadow-lg items-center gap-3 shrink-0 w-[300px] border border-slate-800 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <div className="w-7 h-7 bg-[#229ED9] rounded-full flex items-center justify-center shrink-0 font-bold text-white shadow-sm">
              <Send
                size={12}
                className="fill-white text-white -translate-x-[1px] translate-y-[0.5px]"
              />
            </div>
            <div className="truncate flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-bold text-sky-400 text-[10px]">
                  Telegram Bot
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  LTE 12:45
                </span>
              </div>
              <span className="text-slate-200 block text-[11px] truncate italic font-medium">
                {t("spamLanding.alertsVisualAlert") ||
                  "Notification preview..."}
              </span>
            </div>
          </div>
        </Reveal>

        {/* BLOCK 4: Protection Engine (1x1 Compact - Bottom Right) */}
        <Reveal
          className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between relative"
          direction="up"
          delay={250}
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-500">
                <Zap size={18} />
              </span>
              {t("spamLanding.protectionTitle") || "Anti-Fingerprint"}
            </h3>
            <p className="text-slate-500 mt-1 text-xs leading-relaxed">
              {t("spamLanding.protectionDesc") ||
                "Dynamic system simulation ensuring native interactions."}
            </p>
          </div>

          {/* Visual: Smart Hardware Tags */}
          <div className="hidden lg:flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider mt-2 overflow-hidden whitespace-nowrap">
            <span className="px-2 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-md transition-transform group-hover:scale-105">
              Официальный API
            </span>
            <span className="text-slate-300">/</span>
            <span className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md transition-transform group-hover:scale-105">
              Строго в рамках лимитов
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
