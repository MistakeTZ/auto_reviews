"use client";

import Reveal from "@/components/ui/Reveal";
import { Send, Bell, ShieldAlert, Cpu } from "lucide-react";

type BotAlertsSectionProps = {
  t: (key: string) => string;
  language: string;
};

export default function BotAlertsSection({ t }: BotAlertsSectionProps) {
  return (
    <section
      id="bot-alerts"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 border-b border-slate-100"
    >
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Descriptive list */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <Reveal
              as="span"
              className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
              direction="up"
            >
              {t("spamLanding.alertsTag")}
            </Reveal>
            <Reveal
              as="h2"
              className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
              direction="up"
              delay={90}
            >
              {t("spamLanding.alertsTitle")}
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal className="flex gap-4 items-start" delay={120}>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Bell size={18} />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed m-0">
                {t("spamLanding.alertsDesc1")}
              </p>
            </Reveal>

            <Reveal className="flex gap-4 items-start" delay={180}>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <ShieldAlert size={18} />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed m-0">
                {t("spamLanding.alertsDesc2")}
              </p>
            </Reveal>

            <Reveal className="flex gap-4 items-start" delay={240}>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Cpu size={18} />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed m-0">
                {t("spamLanding.alertsDesc3")}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Telegram Chat mockup */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <Reveal
            className="w-full max-w-[420px] bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-xl relative"
            direction="up"
            delay={200}
          >
            {/* Header phone status bar */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-4 font-mono">
              <span>LTE 12:45 PM</span>
              <span className="text-[#229ED9] font-semibold flex items-center gap-1">
                <Send size={10} className="fill-[#229ED9]" /> Telegram
              </span>
            </div>

            {/* Telegram App chat window wrapper */}
            <div className="bg-[#e8ecef] border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center font-bold text-xs">
                    RS
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 leading-none">reSpam Bot</h5>
                    <span className="text-[9px] text-slate-400 leading-none">official bot assistant</span>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 font-bold font-mono">12:44</span>
              </div>

              {/* Message block */}
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3.5 text-xs text-slate-700 font-mono shadow-sm">
                <p className="m-0 leading-relaxed text-[11px]">
                  {t("spamLanding.alertsVisualAlert")}
                </p>
              </div>

              {/* Bot action buttons mock */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <div className="bg-white border border-slate-200 text-center py-2.5 rounded-xl text-[#229ED9] hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                  Resume campaign
                </div>
                <div className="bg-white border border-slate-200 text-center py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                  Open WB Chat
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
