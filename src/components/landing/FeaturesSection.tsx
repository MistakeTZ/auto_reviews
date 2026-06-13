import React from "react";
import Reveal from "../ui/Reveal";

type FeaturesSectionProps = {
  t: (key: string) => string;
};

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
    >
      <div className="about-us-intro mx-auto mb-12 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("features.tag")}
        </Reveal>
        <Reveal
          as="h2"
          className="about-us-headline m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={90}
        >
          {t("features.title")}
        </Reveal>
      </div>

      {/* Bento Grid Сетка */}
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max lg:auto-rows-[240px]">
        {/* КАРТОЧКА 1: ИИ-Ассистент (Большая: 2 колонки, 2 строки на десктопе) */}
        <div className="group md:col-span-2 lg:row-span-2 bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col justify-between">
          <div className="max-w-md z-10">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl inline-flex mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {t("features.aiTitle")}
            </h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              {t("features.aiDesc")}
            </p>
          </div>

          {/* Визуал: Эмуляция чата ИИ */}
          <div className="hidden lg:flex mt-4 w-full lg:mt-0 lg:ml-auto lg:w-[45%] bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex-col gap-3 text-xs">
            <div className="bg-white border border-slate-100 rounded-xl p-3 max-w-[85%] shadow-sm self-start">
              <div className="font-semibold text-amber-500 mb-0.5">
                {t("features.mockBuyer")}
              </div>
              <p className="text-slate-600">{t("features.mockReviewText")}</p>
            </div>
            <div className="bg-indigo-600 rounded-xl p-3 max-w-[85%] shadow-sm self-end text-white relative transition-transform duration-300 group-hover:-translate-y-1">
              <div className="font-semibold text-indigo-200 mb-0.5 flex justify-between items-center gap-4">
                <span>{t("features.mockAssistant")}</span>
                <span className="bg-indigo-500/50 text-[10px] px-1.5 py-0.5 rounded text-white font-medium">
                  {t("features.mockAiBadge")}
                </span>
              </div>
              <p className="leading-normal">{t("features.mockReplyText")}</p>
            </div>
          </div>
        </div>

        {/* КАРТОЧКА 2: Синхронизация WB (Высокая: 1 колонка, 2 строки на десктопе) */}
        <div className="group lg:col-span-1 md:col-span-2 lg:row-span-2 bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col justify-between">
          <div className="z-10">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl inline-flex mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8.5 7.5M12 5v12"
                />
              </svg>
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {t("features.syncTitle")}
            </h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              {t("features.syncDesc")}
            </p>
          </div>

          {/* Визуал: Каскад карточек WB */}
          <div className="hidden lg:flex relative w-full h-[120px] mt-4 justify-center">
            <div className="absolute bottom-[-20px] w-[160px] h-[130px] bg-slate-50 border border-slate-100 rounded-xl p-2 shadow-sm transform -rotate-6 -translate-x-12 group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-full h-[60px] bg-slate-200 rounded-lg mb-1 animate-pulse" />
              <div className="h-2 w-3/4 bg-slate-300 rounded mb-1" />
              <div className="h-2 w-1/2 bg-slate-200 rounded" />
            </div>
            <div className="absolute bottom-[-10px] w-[160px] h-[130px] bg-white border border-slate-200 rounded-xl p-2 shadow-md z-10 group-hover:-translate-y-4 transition-transform duration-300">
              <div className="w-full h-[60px] bg-indigo-50 rounded-lg mb-2 flex items-center justify-center text-indigo-600 font-bold text-xs">
                Wildberries
              </div>
              <div className="h-2.5 w-5/6 bg-slate-800 rounded mb-1.5" />
              <div className="h-2 w-1/2 bg-slate-200 rounded" />
            </div>
            <div className="absolute bottom-[-20px] w-[160px] h-[130px] bg-slate-50 border border-slate-100 rounded-xl p-2 shadow-sm transform rotate-6 translate-x-12 group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-full h-[60px] bg-slate-200 rounded-lg mb-1 animate-pulse" />
              <div className="h-2 w-3/4 bg-slate-300 rounded mb-1" />
              <div className="h-2 w-1/2 bg-slate-200 rounded" />
            </div>
          </div>
        </div>

        {/* КАРТОЧКА 3: Конструктор правил (1 колонка, 1 строка) */}
        <div className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between relative">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </span>
              {t("features.rulesTitle")}
            </h3>
            <p className="text-slate-500 mt-1 text-xs">
              {t("features.rulesDesc")}
            </p>
          </div>

          {/* Визуал: Компактные теги логики */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-medium mt-2 overflow-hidden whitespace-nowrap">
            <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-md">
              {t("features.mockRuleIf")}
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md">
              {t("features.mockRuleAnd")}
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-2 py-1 bg-indigo-600 text-white rounded-md transition-transform group-hover:scale-105">
              {t("features.mockRuleThen")}
            </span>
          </div>
        </div>

        {/* КАРТОЧКА 4: Мгновенные уведомления (1 колонка, 1 строка) */}
        <div className="hidden lg:flex group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex-col justify-between relative">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </span>
              {t("features.notifyTitle")}
            </h3>
            <p className="text-slate-500 mt-1 text-xs">
              {t("features.notifyDesc")}
            </p>
          </div>

          {/* Визуал: Всплывающий Пуш Telegram */}
          <div className="hidden lg:flex bg-slate-900 text-white text-[11px] rounded-xl p-2.5 shadow-md items-center gap-2.5 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold text-white">
              TG
            </div>
            <div className="truncate">
              <span className="font-semibold text-sky-400 block text-[9px] leading-tight">
                {t("features.mockTgBot")}
              </span>
              <span className="text-slate-200">
                {t("features.mockTgAlert")}
              </span>
            </div>
          </div>
        </div>

        {/* КАРТОЧКА 5: Анализ тональности и инсайты (1 колонка на десктопе, 2 на планшете) */}
        <div className="hidden lg:flex group md:col-span-2 lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex-col justify-between relative">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </span>
              {t("features.analyticsTitle")}
            </h3>
            <p className="text-slate-500 mt-1 text-xs">
              {t("features.analyticsDesc")}
            </p>
          </div>

          {/* Визуал: Бейджи плюсов и минусов */}
          <div className="flex gap-2 mt-3 text-xs">
            <div className="flex-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg p-2 text-center transition-transform duration-300 group-hover:-translate-y-0.5">
              <span className="font-bold block text-xs">
                {t("features.mockPros").split(" ").slice(1).join(" ")}
              </span>
              {t("features.mockProsText")}
            </div>
            <div className="flex-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg p-2 text-center transition-transform duration-300 group-hover:-translate-y-0.5">
              <span className="font-bold block text-xs">
                {t("features.mockCons").split(" ").slice(1).join(" ")}
              </span>
              {t("features.mockConsText")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
