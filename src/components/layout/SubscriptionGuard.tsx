"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { Lock, Gift, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { hasActiveSubscription, trialActivated, tariffType, isAuthenticated, hasLoadedProfile, registrationBonusDays } = useAppStore();
  const { t, language } = useTranslation();
  const router = useRouter();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (!hasLoadedProfile) {
    return null;
  }

  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  // If not active, show the premium lock screen
  const isTrialNotStarted = !trialActivated;
  const isTrialExpired = trialActivated && tariffType === 'trial';
  const trialDays = 7 + Math.max(0, Number(registrationBonusDays || 0));
  const trialNotStartedTitle = language === 'ru'
    ? `Активируйте бесплатный пробный период до осени`
    : `Activate free trial period until autumn`;

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
              {t('subscription.trialNotStartedDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={() => router.push('/settings')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 text-sm"
              >
                <Sparkles size={18} />
                {t('subscription.buyPlanBtn')}
              </Button>
            </div>
          </>
        ) : isTrialExpired ? (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              {t('subscription.trialExpiredTitle')}
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed mb-8">
              {t('subscription.trialExpiredDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={() => router.push('/referrals')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 text-sm"
              >
                <Sparkles size={18} />
                {t('subscription.buyPlanBtn')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              {t('subscription.expiredTitle')}
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed mb-8">
              {t('subscription.expiredDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={() => router.push('/referrals')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 text-sm"
              >
                <CreditCard size={18} />
                {t('subscription.buyPlanBtn')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
