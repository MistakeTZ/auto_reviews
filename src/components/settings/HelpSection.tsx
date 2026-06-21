"use client";

import { Mail, MessageSquare } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";

export default function HelpSection() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/40 shadow-sm shadow-slate-200/30">
      <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left z-10">
        <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 scale-95 hover:scale-100 transition-transform">
          <MessageSquare size={26} className="stroke-[2]" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-ping" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 leading-snug">
            {t("settings.helpTitle")}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t("settings.helpDesc")}
          </p>
        </div>
      </div>

      <a
        href="https://t.me/+375259863436"
        target="_blank"
        rel="noreferrer"
        className="mt-6 md:mt-0 w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs shadow-sm hover:shadow-md transition-all shrink-0 active:scale-95"
      >
        <Mail size={14} className="stroke-[2]" />
        <span>{t("settings.writeToSupport")}</span>
      </a>
    </div>
  );
}
