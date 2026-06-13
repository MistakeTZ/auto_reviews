"use client";

import { useEffect, useState } from "react";
import { Zap, Settings, ShieldCheck, Star, Sparkles, Sliders, Lock, EyeOff } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useAppStore } from "@/store/useAppStore";

type FeaturesSectionProps = {
  t: (key: string) => string;
};

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  const language = useAppStore((state) => state.language);
  const [repliesStep, setRepliesStep] = useState(0); // 0: Idle, 1: Review Received, 2: Typing, 3: Answered

  // Dynamic animation timer for Card 1 (Instant Replies)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const runAnimation = () => {
      if (repliesStep === 0) {
        timer = setTimeout(() => setRepliesStep(1), 1500);
      } else if (repliesStep === 1) {
        timer = setTimeout(() => setRepliesStep(2), 2000);
      } else if (repliesStep === 2) {
        timer = setTimeout(() => setRepliesStep(3), 1500);
      } else if (repliesStep === 3) {
        timer = setTimeout(() => setRepliesStep(0), 4000);
      }
    };
    runAnimation();
    return () => clearTimeout(timer);
  }, [repliesStep]);

  // Localized terms for high-fidelity mockups
  const localT = {
    en: {
      author: "Anna K.",
      product: "Wool Blend Sweater",
      reviewText: "The sweater is so soft and warm! Delivery was fast.",
      replyText: "Anna, thank you for your feedback! We are glad the sweater kept you warm. Looking forward to your next orders!",
      today: "Today, 14:02",
      repliedBadge: "Replied in 1.4s",
      thinking: "AI drafting reply...",
      
      ruleTitle: "Active Automation Rules",
      ruleRating5: "Rule #1: High Rating",
      ruleRating5Action: "Gratitude Template",
      ruleRatingLow: "Rule #2: Low Rating (1-3★)",
      ruleRatingLowAction: "Apologize + Telegram",
      ruleCondition: "Condition",
      ruleAction: "Action",
      ruleActive: "Active",
      
      apiHeader: "WB Integration",
      apiTokenLabel: "WB OpenAPI Token",
      apiScopeTitle: "Token Permissions",
      apiScopeFeedbacks: "Reviews & Questions",
      apiScopeContent: "Content Manager",
      apiScopeFinance: "Financials & Prices",
      apiScopeFinanceStatus: "Locked",
      apiScopeAllowed: "Allowed",
      apiStatus: "Connected",
    },
    ru: {
      author: "Анна К.",
      product: "Свитер из шерсти",
      reviewText: "Свитер очень мягкий и теплый! Доставили быстро.",
      replyText: "Анна, спасибо за отзыв! Рады, что свитер согрел вас в холодную погоду. Будем рады новым заказам!",
      today: "Сегодня, 14:02",
      repliedBadge: "Отвечено за 1.4 сек",
      thinking: "ИИ составляет ответ...",
      
      ruleTitle: "Активные правила",
      ruleRating5: "Правило №1: 5 звезд",
      ruleRating5Action: "Благодарность",
      ruleRatingLow: "Правило №2: Оценка 1-3★",
      ruleRatingLowAction: "Извинение + Telegram",
      ruleCondition: "Условие",
      ruleAction: "Действие",
      ruleActive: "Активно",
      
      apiHeader: "Интеграция с WB",
      apiTokenLabel: "Токен WB OpenAPI",
      apiScopeTitle: "Разрешения токена",
      apiScopeFeedbacks: "Вопросы и отзывы",
      apiScopeContent: "Контент и карточки",
      apiScopeFinance: "Финансы и цены",
      apiScopeFinanceStatus: "Блок",
      apiScopeAllowed: "Доступно",
      apiStatus: "Подключено",
    }
  };

  const currentT = localT[language] || localT.en;

  return (
    <section
      className="services-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{ contentVisibility: "auto", containIntrinsicSize: "840px" }}
    >
      <Reveal
        className="services-header mx-auto mb-14 max-w-[1200px] text-center"
        direction="up"
      >
        <span className="services-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.8px] text-[#1f366c]">
          {t("landing.capabilities")}
        </span>
        <h2 className="services-title m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]">
          {t("landing.feature1Title")
            ? t("landing.ourPowerfulFeatures")
            : t("landing.features")}
        </h2>
      </Reveal>

      <div className="services-grid mx-auto grid max-w-[1200px] gap-7 md:grid-cols-2 xl:grid-cols-3 items-stretch">
        
        {/* Feature 1: Instant Replies */}
        <Reveal
          className="service-card flex flex-col rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-7 transition duration-300 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"
          direction="zoom"
          delay={120}
        >
          {/* Mockup Container */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200/80 relative min-h-[210px] flex flex-col justify-between font-sans shadow-sm overflow-hidden select-none">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {language === "ru" ? "Имитация автоответа" : "Auto-Reply Simulator"}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Review Section */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    A
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-slate-800 m-0 leading-none">{currentT.author}</h5>
                    <span className="text-[9px] text-slate-400">{currentT.today}</span>
                  </div>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  <Star size={10} fill="currentColor" />
                  <Star size={10} fill="currentColor" />
                  <Star size={10} fill="currentColor" />
                  <Star size={10} fill="currentColor" />
                  <Star size={10} fill="currentColor" />
                </div>
              </div>
              <p className="m-0 text-[10px] text-slate-600 leading-relaxed font-semibold">
                {currentT.reviewText}
              </p>
            </div>

            {/* Reply Section */}
            <div className="min-h-[72px] flex items-center justify-center mt-3">
              {repliesStep === 0 && (
                <span className="text-[10px] text-slate-400 font-bold italic animate-pulse">
                  {language === "ru" ? "Ожидание нового отзыва..." : "Waiting for new review..."}
                </span>
              )}
              
              {repliesStep === 1 && (
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 animate-pulse">
                  {language === "ru" ? "Новый отзыв обнаружен!" : "New review detected!"}
                </span>
              )}

              {repliesStep === 2 && (
                <div className="w-full bg-slate-100/60 border border-slate-200/50 rounded-xl p-3 text-[10px] flex items-center justify-between text-slate-600 animate-pulse">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles size={12} className="text-indigo-500 animate-spin" />
                    {currentT.thinking}
                  </span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {repliesStep === 3 && (
                <div className="w-full bg-indigo-50/70 border border-indigo-100/80 rounded-xl p-3 text-[10px] text-slate-800 shadow-inner flex flex-col gap-1.5 animate-[fadeIn_300ms_ease-out]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#2530D9] flex items-center gap-1">
                      <Sparkles size={11} className="fill-indigo-100" />
                      reAnswer AI
                    </span>
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/40">
                      {currentT.repliedBadge}
                    </span>
                  </div>
                  <p className="m-0 leading-relaxed font-semibold">{currentT.replyText}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
              <Zap size={24} />
            </div>
            <h3 className="text-[1.2rem] font-bold text-[#0A192F] m-0">
              {t("landing.feature1Title")}
            </h3>
          </div>
          <p className="text-[0.92rem] leading-[1.6] text-[#4A5568] m-0 flex-1">
            {t("landing.feature1Desc")}
          </p>
        </Reveal>

        {/* Feature 2: Smart Rules */}
        <Reveal
          className="service-card flex flex-col rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-7 transition duration-300 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"
          direction="zoom"
          delay={210}
        >
          {/* Mockup Container */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200/80 relative min-h-[210px] flex flex-col justify-between font-sans shadow-sm overflow-hidden select-none">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {currentT.ruleTitle}
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sliders size={10} />
                {language === "ru" ? "Настройка" : "Manage"}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              {/* Rule #1 */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm hover:border-indigo-300 transition duration-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-extrabold text-slate-800">
                    {currentT.ruleRating5}
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    {currentT.ruleActive}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-semibold text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                    {currentT.ruleCondition}: ★ = 5
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="bg-indigo-50 border border-indigo-100 text-[#2530D9] px-1.5 py-0.5 rounded">
                    {currentT.ruleRating5Action}
                  </span>
                </div>
              </div>

              {/* Rule #2 */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm hover:border-indigo-300 transition duration-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-extrabold text-slate-800">
                    {currentT.ruleRatingLow}
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    {currentT.ruleActive}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-semibold text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                    {currentT.ruleCondition}: ★ ≤ 3
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="bg-amber-50 border border-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                    {currentT.ruleRatingLowAction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
              <Settings size={24} />
            </div>
            <h3 className="text-[1.2rem] font-bold text-[#0A192F] m-0">
              {t("landing.feature2Title")}
            </h3>
          </div>
          <p className="text-[0.92rem] leading-[1.6] text-[#4A5568] m-0 flex-1">
            {t("landing.feature2Desc")}
          </p>
        </Reveal>

        {/* Feature 3: Secure Integration */}
        <Reveal
          className="service-card flex flex-col rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-7 transition duration-300 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"
          direction="zoom"
          delay={300}
        >
          {/* Mockup Container */}
          <div className="bg-slate-900 rounded-2xl p-5 mb-6 text-slate-200 font-sans shadow-inner border border-slate-800 relative overflow-hidden select-none min-h-[210px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                {currentT.apiHeader}
              </span>
              <span className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentT.apiStatus}
              </span>
            </div>

            {/* Key Input */}
            <div className="mb-2">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {currentT.apiTokenLabel}
              </label>
              <div className="relative bg-slate-950/80 rounded-lg p-2 border border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-300">
                <span className="tracking-widest">wb_api_••••••••••••</span>
                <Lock size={10} className="text-slate-500" />
              </div>
            </div>

            {/* Scopes Section */}
            <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {currentT.apiScopeTitle}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-semibold">
                  <span className="text-slate-300">{currentT.apiScopeFeedbacks}</span>
                  <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                    {currentT.apiScopeAllowed}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-semibold">
                  <span className="text-slate-300">{currentT.apiScopeContent}</span>
                  <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                    {currentT.apiScopeAllowed}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-semibold opacity-60">
                  <span className="text-slate-500 flex items-center gap-1">
                    <EyeOff size={9} className="text-rose-500/80" />
                    {currentT.apiScopeFinance}
                  </span>
                  <span className="text-[8px] text-rose-400 font-bold bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
                    {currentT.apiScopeFinanceStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-[1.2rem] font-bold text-[#0A192F] m-0">
              {t("landing.feature3Title")}
            </h3>
          </div>
          <p className="text-[0.92rem] leading-[1.6] text-[#4A5568] m-0 flex-1">
            {t("landing.feature3Desc")}
          </p>
        </Reveal>

      </div>
    </section>
  );
}
