"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Zap, Settings, Lock, Check, AlertTriangle } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useAppStore } from "@/store/useAppStore";

type SecurityGuaranteesSectionProps = {
  t: (key: string) => string;
};

export default function SecurityGuaranteesSection({
  t,
}: SecurityGuaranteesSectionProps) {
  const language = useAppStore((state) => state.language);
  const [aiSandboxStep, setAiSandboxStep] = useState(0); // 0: drafting, 1: intercepted, 2: secured
  const [typingText, setTypingText] = useState("");

  // AI Sandbox Auto-looping State Machine
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const originalDraftText = language === "ru"
      ? "Спасибо за покупку! Пожалуйста, если возникнут вопросы, звоните нам напрямую: +7 (999) 123-45-67 или пишите в ТГ @seller_manager."
      : "Thank you for your purchase! If you have questions, please call us directly at +7 (999) 123-45-67 or TG @seller_manager.";

    const redactedDraftText = language === "ru"
      ? "Спасибо за покупку! Пожалуйста, если возникнут вопросы, напишите нам в чат покупателя Wildberries. Будем рады видеть вас снова!"
      : "Thank you for your purchase! If you have questions, please write to us in the Wildberries customer chat. We look forward to seeing you again!";

    if (aiSandboxStep === 0) {
      // Typing animation
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < originalDraftText.length) {
          setTypingText(originalDraftText.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          // Advance to intercepted step after typing finishes
          timer = setTimeout(() => {
            setAiSandboxStep(1);
          }, 1500);
        }
      }, 25);

      return () => {
        clearInterval(typingInterval);
        clearTimeout(timer);
      };
    } else if (aiSandboxStep === 1) {
      // Flash interception block for 2 seconds
      timer = setTimeout(() => {
        setAiSandboxStep(2);
        setTypingText(redactedDraftText);
      }, 2000);
    } else if (aiSandboxStep === 2) {
      // Show clean text for 3.5 seconds, then loop back
      timer = setTimeout(() => {
        setTypingText("");
        setAiSandboxStep(0);
      }, 3500);
    }

    return () => clearTimeout(timer);
  }, [aiSandboxStep, language]);

  return (
    <section className="security-guarantees-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <Reveal className="text-center mb-16" direction="up">
          <span className="eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]">
            {t("landing.security")}
          </span>
          <h2 className="text-[clamp(1.8rem,3.4vw,2.75rem)] font-black leading-[1.15] tracking-tight text-[#0A192F] m-0 max-w-[28ch] mx-auto">
            {t("landing.securityTitle")}
          </h2>
        </Reveal>

        {/* Bento Grid Layout */}
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          
          {/* Card 1: Scoped Permissions Mockup */}
          <Reveal
            className="flex flex-col rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-7 transition duration-300 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)]"
            direction="up"
            delay={120}
          >
            {/* High-Fidelity WB Developer Portal Permissions Toggle Panel */}
            <div className="bg-slate-900 rounded-2xl p-5 mb-6 text-slate-200 font-sans shadow-inner border border-slate-800 relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  {language === "ru" ? "Доступы токена WB API" : "WB API Token Permissions"}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-3.5">
                {/* Content - Active */}
                <div className="flex items-center justify-between bg-slate-800/40 rounded-xl p-3 border border-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400">●</span>
                    <span className="text-sm font-bold text-slate-100">
                      {language === "ru" ? "Контент" : "Content"}
                    </span>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-end px-0.5 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-emerald-400 shadow" />
                  </div>
                </div>

                {/* Reviews & Questions - Active */}
                <div className="flex items-center justify-between bg-slate-800/40 rounded-xl p-3 border border-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400">●</span>
                    <span className="text-sm font-bold text-slate-100">
                      {language === "ru" ? "Вопросы и отзывы" : "Questions & Feedbacks"}
                    </span>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-end px-0.5 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-emerald-400 shadow" />
                  </div>
                </div>

                {/* Pricing & Discounts - Disabled & Locked */}
                <div className="flex items-center justify-between opacity-50 bg-slate-800/20 rounded-xl p-3 border border-dashed border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Lock size={12} className="text-rose-500" />
                    <span className="text-sm font-bold text-slate-400">
                      {language === "ru" ? "Цены и скидки" : "Prices & Discounts"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    {language === "ru" ? "БЛОК" : "LOCKED"}
                  </span>
                </div>

                {/* Finance - Disabled & Locked */}
                <div className="flex items-center justify-between opacity-50 bg-slate-800/20 rounded-xl p-3 border border-dashed border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Lock size={12} className="text-rose-500" />
                    <span className="text-sm font-bold text-slate-400">
                      {language === "ru" ? "Финансы" : "Finance"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    {language === "ru" ? "БЛОК" : "LOCKED"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#2530D9]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-[1.2rem] font-bold text-[#0A192F] m-0">
                {t("landing.securityFeature1Title")}
              </h3>
            </div>
            <p className="text-[0.92rem] leading-[1.6] text-[#4A5568] m-0 flex-1">
              {t("landing.securityFeature1Desc")}
            </p>
          </Reveal>

          {/* Card 2: AI Sandbox Guardrail Animation */}
          <Reveal
            className="flex flex-col rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-7 transition duration-300 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)]"
            direction="up"
            delay={210}
          >
            {/* Animated AI Sandbox Text Editor Screen */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200/80 relative min-h-[196px] flex flex-col justify-between font-sans shadow-sm overflow-hidden select-none">
              
              {/* Card Header Status */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {language === "ru" ? "ИИ-Автоответ: Фильтр" : "AI Auto-reply Filter"}
                </span>
                {aiSandboxStep === 0 && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/40 animate-pulse">
                    {language === "ru" ? "Генерация черновика..." : "Drafting..."}
                  </span>
                )}
                {aiSandboxStep === 1 && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/40 flex items-center gap-1">
                    <AlertTriangle size={12} className="animate-bounce" />
                    {language === "ru" ? "ПЕРЕХВАТ КОНТАКТОВ" : "CONTACTS DETECTED"}
                  </span>
                )}
                {aiSandboxStep === 2 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/40 flex items-center gap-1">
                    <Check size={12} />
                    {language === "ru" ? "ОДОБРЕНО И БЕЗОПАСНО" : "SAFE & APPROVED"}
                  </span>
                )}
              </div>

              {/* Text Field content box */}
              <div className={`p-3 rounded-xl min-h-[96px] text-xs font-medium leading-relaxed transition-all duration-300 border flex-1 ${
                aiSandboxStep === 1 
                  ? "bg-rose-50/50 border-rose-200 text-rose-800 shadow-sm shadow-rose-100" 
                  : aiSandboxStep === 2 
                    ? "bg-emerald-50/20 border-emerald-200 text-emerald-950" 
                    : "bg-white border-slate-200 text-slate-700"
              }`}>
                {typingText}
                <span className="animate-ping ml-0.5 text-slate-400">|</span>
              </div>

              {/* Guardrail Status Overlay Panel */}
              {aiSandboxStep === 1 && (
                <div className="absolute inset-0 bg-rose-600/90 flex flex-col justify-center items-center text-center p-4 transition-all duration-300 animate-fade-in">
                  <AlertTriangle size={36} className="text-white mb-2 animate-bounce" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {language === "ru" ? "Обнаружен телефон / контакты!" : "External contact intercepted!"}
                  </span>
                  <span className="text-xs text-rose-100 mt-1 max-w-[28ch]">
                    {language === "ru" ? "Система автоматически блокирует отправку и форматирует текст" : "System intercepts and auto-redacts templates to prevent WB penalties"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#2530D9]">
                <Zap size={24} />
              </div>
              <h3 className="text-[1.2rem] font-bold text-[#0A192F] m-0">
                {t("landing.securityFeature2Title")}
              </h3>
            </div>
            <p className="text-[0.92rem] leading-[1.6] text-[#4A5568] m-0 flex-1">
              {t("landing.securityFeature2Desc")}
            </p>
          </Reveal>

          {/* Card 3: Human Input Simulator */}
          <Reveal
            className="flex flex-col rounded-[24px] border border-[rgba(10,25,47,0.08)] bg-white p-7 transition duration-300 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)] md:col-span-2 lg:col-span-1"
            direction="up"
            delay={300}
          >
            {/* Interactive Human Delay Timer and waves */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200/80 min-h-[196px] flex flex-col justify-between font-sans shadow-sm select-none">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {language === "ru" ? "Режим имитации человека" : "Human Simulation Mode"}
                </span>
                <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-purple-200/40">
                  {language === "ru" ? "Активно" : "ACTIVE"}
                </span>
              </div>
              <div className="my-5 flex flex-col items-center justify-center">
                <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
                  <span>00:42</span>
                  <span className="text-xs text-slate-400 font-bold uppercase">{language === "ru" ? "задержка" : "delay"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1.5 uppercase">
                  {language === "ru" ? "Случайная пауза перед отправкой" : "Randomizing send intervals"}
                </p>
              </div>
              {/* Typing indicators waving dots */}
              <div className="flex items-center justify-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200/40">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                  {language === "ru" ? "Имитация ввода" : "Simulating keystrokes"}
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2530D9] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2530D9] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2530D9] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#2530D9]">
                <Settings size={24} />
              </div>
              <h3 className="text-[1.2rem] font-bold text-[#0A192F] m-0">
                {t("landing.securityFeature3Title")}
              </h3>
            </div>
            <p className="text-[0.92rem] leading-[1.6] text-[#4A5568] m-0 flex-1">
              {t("landing.securityFeature3Desc")}
            </p>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
