"use client";

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

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-12">
        <Reveal
          className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2 lg:col-span-7 lg:row-span-2"
          direction="up"
          delay={120}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Calendar size={18} />
              </span>
              <h3 className="mt-3 text-xl font-bold text-slate-900">
                {t("spamLanding.schedulingTitle")}
              </h3>
            </div>
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
              {t("spamLanding.schedulingTag")}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Calendar size={15} className="text-indigo-600" />
                  {t("spam.frequency") || "Frequency"}
                </div>
                <p className="m-0 text-sm leading-relaxed text-slate-500">
                  {t("spamLanding.schedulingDesc1")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Clock size={15} className="text-emerald-600" />
                  {t("spam.moscowHours")?.split(" (")[0] || "Moscow Time"}
                </div>
                <p className="m-0 text-sm leading-relaxed text-slate-500">
                  {t("spamLanding.schedulingDesc2")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ShieldCheck size={15} className="text-amber-600" />
                  {t("spam.timeRange")?.split(".")[0] || "Random Offset"}
                </div>
                <p className="m-0 text-sm leading-relaxed text-slate-500">
                  {t("spamLanding.schedulingDesc3")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Clock size={15} className="text-indigo-600" />
                {t("spamLanding.schedulingTimelineTitle")}
              </h4>
              <div className="space-y-3">
                <div className="rounded-xl border border-indigo-100 bg-white p-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      {t("spamLanding.schedulingTimelineItem1")}
                    </span>
                    <span className="font-mono text-slate-400">14:00 (MCK)</span>
                  </div>
                  <p className="m-0 text-xs text-slate-500">
                    {t("spamLanding.schedulingTimelineOffset")}: +12m 37s
                  </p>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-purple-700">
                      {t("spamLanding.schedulingTimelineItem2")}
                    </span>
                    <span className="font-mono text-slate-400">18:00 (MCK)</span>
                  </div>
                  <p className="m-0 text-xs text-slate-500">
                    {t("spamLanding.schedulingTimelineOffset")}: +4m 19s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal
          className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:col-span-5"
          direction="up"
          delay={170}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-xl bg-rose-50 p-2 text-rose-600">
                <ShieldAlert size={18} />
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                {t("spamLanding.pauseTitle")}
              </h3>
            </div>
            <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
              {t("spamLanding.pauseTag")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs font-semibold">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <MessageSquare className="mx-auto mb-1 text-indigo-600" size={14} />
              <span>{t("spamLanding.pauseVisualStep1")}</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <RefreshCw className="mx-auto mb-1 text-indigo-600" size={14} />
              <span>{t("spamLanding.pauseVisualStep2")}</span>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
              <ShieldAlert className="mx-auto mb-1" size={14} />
              <span>{t("spamLanding.pauseVisualStep3")}</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
              <UserCheck className="mx-auto mb-1" size={14} />
              <span>{t("spamLanding.pauseVisualStep4")}</span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {t("spamLanding.pauseDesc2")}
          </p>
        </Reveal>

        <Reveal
          className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:col-span-5"
          direction="up"
          delay={220}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-xl bg-sky-50 p-2 text-sky-600">
                <Bell size={18} />
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                {t("spamLanding.alertsTitle")}
              </h3>
            </div>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
              {t("spamLanding.alertsTag")}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#e8ecef] p-4">
            <div className="mb-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>LTE 12:45 PM</span>
              <span className="flex items-center gap-1 font-semibold text-[#229ED9]">
                <Send size={10} className="fill-[#229ED9]" /> Telegram
              </span>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white p-3 text-[11px] leading-relaxed text-slate-700">
              {t("spamLanding.alertsVisualAlert")}
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {t("spamLanding.alertsDesc2")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}