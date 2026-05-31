"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Monitor, CheckCircle2, ChevronRight, HelpCircle, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function TokenInstructionsPage() {
  const { t, language } = useTranslation();

  return (
    <div className="pt-24 px-4 pb-12 md:p-8 w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
        <Link href="/settings" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
          {t("settings.title")}
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-800 font-semibold">{t("settings.tokenGuideTitle")}</span>
      </nav>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <HelpCircle size={12} className="text-indigo-600 animate-pulse" />
          <span>{language === "en" ? "Help Guide" : "Руководство"}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t("settings.tokenGuideTitle")}
        </h1>
        <p className="text-slate-600 max-w-2xl text-base md:text-lg leading-relaxed">
          {t("settings.tokenGuideIntro")}
        </p>
      </div>

      {/* Warnings & Alerts */}
      <div className="p-4 md:p-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-amber-50/40 text-amber-900 flex items-start gap-4 shadow-sm shadow-amber-100/50">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-700 flex-shrink-0">
          <Monitor size={22} className="stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <p className="font-extrabold text-amber-950 text-base">
            {language === "en" ? "Important Note" : "Важное примечание"}
          </p>
          <p className="text-sm text-amber-800/90 leading-relaxed font-medium">
            {t("settings.tokenGuideDesktopNote")}
          </p>
        </div>
      </div>

      {/* Steps Wrapper */}
      <div className="space-y-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-indigo-600" />
          {language === "en" ? "Step-by-step Guide" : "Пошаговые действия"}
        </h2>

        {/* Step 1 */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="p-6 md:p-8 lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-lg shadow-indigo-200">
                1
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {t("settings.tokenGuideStep1Title")}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {t("settings.tokenGuideStep1Desc")}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === "en" ? "Recommended action" : "Рекомендуемое действие"}
              </span>
              <a
                href="https://seller.wildberries.ru/"
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors w-fit group"
              >
                <span>{language === "en" ? "Open WB Partners" : "Открыть WB Партнеры"}</span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
          <div className="bg-slate-50 p-6 flex items-center justify-center lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200/50">
            <a
              href="/api_integration.webp"
              target="_blank"
              rel="noreferrer"
              className="block relative group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] duration-300 w-full"
            >
              <Image
                src="/api_integration.webp"
                alt={t("settings.tokenGuideImg1Alt")}
                width={800}
                height={500}
                className="h-auto w-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/95 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-md">
                  {language === "en" ? "Zoom Screenshot" : "Увеличить скриншот"}
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="p-6 md:p-8 lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-lg shadow-indigo-200">
                2
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {t("settings.tokenGuideStep2Title")}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {t("settings.tokenGuideStep2Desc")}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === "en" ? "Tips" : "Совет"}
              </span>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {language === "en" 
                  ? "Choose a name that indicates the service connection so you remember it later."
                  : "Дайте токену понятное имя, чтобы сразу понимать, для какого приложения он создан."}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 flex items-center justify-center lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200/50">
            <a
              href="/new_token.webp"
              target="_blank"
              rel="noreferrer"
              className="block relative group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] duration-300 w-full"
            >
              <Image
                src="/new_token.webp"
                alt={t("settings.tokenGuideImg2Alt")}
                width={800}
                height={500}
                className="h-auto w-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/95 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-md">
                  {language === "en" ? "Zoom Screenshot" : "Увеличить скриншот"}
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="p-6 md:p-8 lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-lg shadow-indigo-200">
                3
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {t("settings.tokenGuideStep3Title")}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {t("settings.tokenGuideStep3Desc")}
              </p>
            </div>
            
            {/* Required Permissions Badge Group */}
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>{language === "en" ? "Required Permissions" : "Необходимые права доступа"}</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-emerald-800">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{language === "en" ? "Content (read/write)" : "Контент (чтение и запись)"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{language === "en" ? "Questions & Reviews (read/write)" : "Вопросы и отзывы (чтение и запись)"}</span>
                </li>
              </ul>
              <p className="text-[10px] font-medium text-emerald-700/80 leading-snug">
                {t("settings.tokenGuidePermissionsNote")}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 flex items-center justify-center lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200/50">
            <a
              href="/token_params.webp"
              target="_blank"
              rel="noreferrer"
              className="block relative group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] duration-300 w-full"
            >
              <Image
                src="/token_params.webp"
                alt={t("settings.tokenGuideImg3Alt")}
                width={800}
                height={500}
                className="h-auto w-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/95 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-md">
                  {language === "en" ? "Zoom Screenshot" : "Увеличить скриншот"}
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Back CTA Button */}
      <div className="pt-8 border-t border-slate-200 flex justify-center sm:justify-start">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/10 transition-all hover:shadow-xl active:scale-95 duration-200 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>{language === "en" ? "Back to Settings" : "Вернуться к настройкам"}</span>
        </Link>
      </div>
    </div>
  );
}
