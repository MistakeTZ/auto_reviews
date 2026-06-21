"use client";

import Reveal from "@/components/ui/Reveal";
import { Clock, Calendar, ShieldCheck, HelpCircle } from "lucide-react";

type SmartSchedulingSectionProps = {
  t: (key: string) => string;
};

export default function SmartSchedulingSection({ t }: SmartSchedulingSectionProps) {
  return (
    <section
      id="scheduling"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 border-b border-slate-100"
    >
      <div className="mx-auto mb-12 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50"
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

      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Descriptive details */}
        <div className="lg:col-span-6 space-y-6">
          <Reveal className="flex gap-4 items-start" delay={120}>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0 shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t("spam.frequency") || "Frequency"}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("spamLanding.schedulingDesc1")}
              </p>
            </div>
          </Reveal>

          <Reveal className="flex gap-4 items-start" delay={180}>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0 shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t("spam.moscowHours")?.split(" (")[0] || "Moscow Time Matching"}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("spamLanding.schedulingDesc2")}
              </p>
            </div>
          </Reveal>

          <Reveal className="flex gap-4 items-start" delay={240}>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t("spam.timeRange")?.split(".")[0] || "Anti-Bot Random Offset"}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("spamLanding.schedulingDesc3")}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Visual timeline simulator */}
        <div className="lg:col-span-6">
          <Reveal
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl"
            direction="right"
            delay={200}
          >
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              {t("spamLanding.schedulingTimelineTitle")}
            </h4>

            <div className="relative border-l border-slate-100 ml-3 pl-6 space-y-6">
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white shadow-sm" />
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded">
                      {t("spamLanding.schedulingTimelineItem1")}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">14:00 (MCK)</span>
                  </div>
                  <div className="text-slate-500 text-xs flex justify-between items-center bg-white p-2.5 rounded-xl border border-dashed border-slate-200">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" />
                      {t("spamLanding.schedulingTimelineOffset")}
                    </span>
                    <strong className="text-slate-700 font-mono">+12 min 37s</strong>
                  </div>
                  <div className="mt-3 text-xs font-bold text-slate-800 flex justify-between">
                    <span>Sent at:</span>
                    <span className="text-emerald-600 font-mono">14:12:37</span>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white shadow-sm" />
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-purple-600 uppercase bg-purple-50 border border-purple-100/50 px-2 py-0.5 rounded">
                      {t("spamLanding.schedulingTimelineItem2")}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">18:00 (MCK)</span>
                  </div>
                  <div className="text-slate-500 text-xs flex justify-between items-center bg-white p-2.5 rounded-xl border border-dashed border-slate-200">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" />
                      {t("spamLanding.schedulingTimelineOffset")}
                    </span>
                    <strong className="text-slate-700 font-mono">+4 min 19s</strong>
                  </div>
                  <div className="mt-3 text-xs font-bold text-slate-800 flex justify-between">
                    <span>Sent at:</span>
                    <span className="text-emerald-600 font-mono">18:04:19</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
