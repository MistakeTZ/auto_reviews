"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Gift, Sparkles, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({
  children,
}: SubscriptionGuardProps) {
  const {
    hasActiveSubscription,
    trialActivated,
    tariffType,
    registrationBonusDays,
    hasActiveSpamSubscription,
    respamTrialActivated,
    respamTariffType,
    respamRegistrationBonusDays,
    isAuthenticated,
    hasLoadedProfile,
  } = useAppStore();
  const { t, language } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const isSpamMode = process.env.NEXT_PUBLIC_IS_SPAM_APP === "true" || pathname.startsWith("/spam");

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (!hasLoadedProfile) {
    return null;
  }

  const activeSub = isSpamMode
    ? hasActiveSpamSubscription
    : hasActiveSubscription;
  const trialAct = isSpamMode ? respamTrialActivated : trialActivated;
  const tariff = isSpamMode ? respamTariffType : tariffType;
  const bonusDays = isSpamMode
    ? respamRegistrationBonusDays
    : registrationBonusDays;

  if (activeSub) {
    return <>{children}</>;
  }

  // If not active, show the premium lock screen
  const isTrialNotStarted = !trialAct;
  const isTrialExpired = trialAct && tariff === "trial";
  const trialDays = 14 + Math.max(0, Number(bonusDays || 0));

  const trialNotStartedTitle = isSpamMode
    ? language === "ru"
      ? `Активируйте бесплатный пробный период reSpam на ${trialDays} дней`
      : `Activate free trial period for reSpam for ${trialDays} days`
    : language === "ru"
      ? `Активируйте бесплатный пробный период на ${trialDays} дней`
      : `Activate free trial period for ${trialDays} days`;

  const trialNotStartedDesc = isSpamMode
    ? language === "ru"
      ? "Подключите свой API токен чатов Wildberries в Настройках reSpam для запуска бесплатного пробного периода."
      : "Connect your Wildberries chats API token in reSpam Settings to launch the free trial period."
    : t("subscription.trialNotStartedDesc");

  const trialExpiredTitle = isSpamMode
    ? language === "ru"
      ? "Пробный период reSpam завершен"
      : "reSpam trial period has ended"
    : t("subscription.trialExpiredTitle");

  const trialExpiredDesc = isSpamMode
    ? language === "ru"
      ? "Ваш бесплатный пробный период reSpam закончился. Приобретите полную подписку на 1 месяц, чтобы автоматизация рассылок продолжала приносить поведению вашего бизнеса пользу, или приглашайте друзей и получайте по 7 дней бесплатно!"
      : "Your free trial period for reSpam has ended. Purchase a full subscription for 1 month to keep spam automation benefiting your business, or invite friends and get 7 days free!"
    : t("subscription.trialExpiredDesc");

  const expiredTitle = isSpamMode
    ? language === "ru"
      ? "Требуется активная подписка reSpam"
      : "Active reSpam subscription required"
    : t("subscription.expiredTitle");

  const expiredDesc = isSpamMode
    ? language === "ru"
      ? "Пожалуйста, активируйте пробный период или приобретите полную подписку reSpam для продолжения работы."
      : "Please activate your trial period or purchase a full reSpam subscription to continue working."
    : t("subscription.expiredDesc");

  const handleActionClick = () => {
    const isSpamApp = process.env.NEXT_PUBLIC_IS_SPAM_APP === "true";
    if (isTrialNotStarted) {
      router.push(isSpamApp ? "/settings" : (isSpamMode ? "/spam/settings" : "/settings"));
    } else {
      router.push(isSpamApp ? "/tariffs" : (isSpamMode ? "/spam/tariffs" : "/referrals"));
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="max-w-xl w-full bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative subtle background gradients */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon Circle */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-8 scale-100 hover:scale-105 transition-all duration-300">
          <Lock size={36} className="animate-pulse" />
        </div>

        {isTrialNotStarted ? (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              {trialNotStartedTitle}
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed mb-8">
              {trialNotStartedDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={handleActionClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 text-sm"
              >
                <Sparkles size={18} />
                {isSpamMode
                  ? language === "ru"
                    ? "Перейти к токену"
                    : "Configure Token"
                  : t("subscription.goToSettings")}
              </Button>
            </div>
          </>
        ) : isTrialExpired ? (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              {trialExpiredTitle}
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed mb-8">
              {trialExpiredDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={handleActionClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 text-sm"
              >
                <Sparkles size={18} />
                {isSpamMode
                  ? language === "ru"
                    ? "Активировать подписку"
                    : "Activate Premium"
                  : t("subscription.buyPlanBtn")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              {expiredTitle}
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed mb-8">
              {expiredDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={handleActionClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 text-sm"
              >
                <CreditCard size={18} />
                {isSpamMode
                  ? language === "ru"
                    ? "Активировать подписку"
                    : "Activate Premium"
                  : t("subscription.buyPlanBtn")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
