"use client";

import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Sparkles, AlertCircle, ArrowRight, UserPlus, ShieldAlert, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReferralsPage() {
  const {
    referralCode,
    tariffType,
    subscriptionExpiresAt,
    hasActiveSubscription,
    trialActivated,
    referrals,
    applyReferralCode,
    buySubscription,
    fetchReferralsList
  } = useAppStore();

  const { t } = useTranslation();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState('');

  useEffect(() => {
    void fetchReferralsList();
  }, [fetchReferralsList]);

  // Calculations for subscription remaining days
  const getDaysInfo = () => {
    if (!subscriptionExpiresAt) return { days: 0, status: 'none' };
    const expiry = new Date(subscriptionExpiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: Math.abs(diffDays),
      status: diffDays > 0 ? 'active' : 'expired'
    };
  };

  const daysInfo = getDaysInfo();

  const handleCopyCode = () => {
    if (referralCode) {
      void navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (referralCode) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://reanswer.ru';
      const link = `${origin}/?ref=${referralCode}`;
      void navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleApplyReferral = async () => {
    if (!refInput.trim()) return;
    setLoadingCode(true);
    setCodeError('');
    setCodeSuccess('');
    try {
      await applyReferralCode(refInput.trim());
      setCodeSuccess(t('referrals.successApplied'));
      setRefInput('');
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setCodeError(err.message || t('referrals.invalidCode'));
    } finally {
      setLoadingCode(false);
    }
  };

  const handleBuySubscription = async () => {
    setPurchasing(true);
    setPurchaseSuccessMsg('');
    try {
      await buySubscription();
      setPurchaseSuccessMsg(t('referrals.purchaseSuccess'));
      void confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
    } catch (err: any) {
      alert(err.message || t('referrals.paymentFailed'));
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Gift className="text-purple-600" size={32} />
          {t('referrals.title')}
        </h1>
        <p className="text-slate-500 font-medium mt-1">{t('referrals.sub')}</p>
      </div>

      {/* Grid: Subscription & Invite Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Subscription Status Card */}
        <Card className="border border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl relative">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={20} />
              {t('referrals.subscriptionStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between h-72">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('referrals.currentPlan')}</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {!hasActiveSubscription
                      ? t('subscription.expiredPlan')
                      : tariffType === 'trial'
                        ? t('subscription.trialPlan')
                        : t('subscription.premiumPlan')}
                  </h3>
                </div>
                <div>
                  {!hasActiveSubscription ? (
                    <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {t('referrals.expired')}
                    </span>
                  ) : tariffType === 'trial' ? (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm animate-pulse">
                      {t('referrals.trialActive')}
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25">
                      {t('referrals.premium')}
                    </span>
                  )}
                </div>
              </div>

              {subscriptionExpiresAt ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>
                      {daysInfo.status === 'active'
                        ? t('subscription.activeDaysLeft').replace('{{days}}', String(daysInfo.days))
                        : t('subscription.expiredDaysAgo').replace('{{days}}', String(daysInfo.days))}
                    </span>
                    <span className="text-slate-400">
                      {t('referrals.expiryLabel')}: {new Date(subscriptionExpiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        !hasActiveSubscription
                          ? 'bg-red-400'
                          : tariffType === 'trial'
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                      style={{ width: !hasActiveSubscription ? '100%' : `${Math.min(100, (daysInfo.days / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-xs font-medium text-slate-600">
                    {t('referrals.noActivePlanHint')}
                  </p>
                </div>
              )}
            </div>

            {tariffType === 'trial' && hasActiveSubscription && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center gap-2">
                <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                <p className="text-xs font-semibold text-amber-800">
                  {t('referrals.trialLimitations')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Friends Card */}
        <Card className="border border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl relative">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <UserPlus className="text-purple-600" size={20} />
              {t('referrals.inviteFriends')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 h-72 flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                {t('referrals.rewardsDesc')}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('referrals.referralCode')}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between font-mono font-bold text-slate-700 text-sm shadow-inner">
                    <span>{referralCode || '...'}</span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                      title={t('referrals.copyReferralCodeTitle')}
                    >
                      {copiedCode ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="gap-1.5 text-xs shrink-0 shadow-sm"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedLink ? t('referrals.copied') : t('referrals.copyLink')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Apply Referrer & Upgrade Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upgrade Premium Card */}
        <Card className="border border-indigo-200 shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white relative">
          {/* Subtle sparkles badge */}
          <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <Sparkles size={10} />
            {t('referrals.bestOffer')}
          </div>

          <CardHeader className="border-b border-indigo-100 bg-indigo-50/30 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={20} />
              {t('referrals.buyTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {t('referrals.buyDesc')}
            </p>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{t('referrals.buyPrice')}</span>
              <span className="text-slate-400 font-bold text-sm uppercase">{t('referrals.buyPeriod')}</span>
            </div>

            <Button
              onClick={handleBuySubscription}
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-sm"
            >
              <CreditCard size={18} />
              {purchasing ? t('referrals.processing') : t('referrals.buyBtn')}
              <ArrowRight size={16} />
            </Button>

            {purchaseSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check size={16} />
                {purchaseSuccessMsg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invited Friends List */}
        <Card className="border border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Gift className="text-purple-600" size={20} />
              {t('referrals.friendsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {referrals && referrals.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">{t('referrals.friendName')}</th>
                      <th className="px-6 py-4">{t('referrals.friendEmail')}</th>
                      <th className="px-6 py-4 text-right">{t('referrals.friendStatus')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((friend: any) => (
                      <tr key={friend.id} className="text-sm font-semibold hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900">{friend.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{friend.email}</td>
                        <td className="px-6 py-4 text-right">
                          {friend.trial_activated ? (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-bold">
                              {t('referrals.friendTrialStarted')}
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs font-bold">
                              {t('referrals.friendNoTrial')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 font-medium">
                <span className="text-4xl block mb-2">👋</span>
                <p className="text-sm font-bold text-slate-700 mb-1">{t('referrals.noReferralsYet')}</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t('referrals.noFriendsYet')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
