"use client";

import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { checkIsSpamApp } from "@/lib/isSpamApp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Gift,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  CreditCard,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatDateTime } from "@/lib/formatDateTime";
import { trackMetrikaGoal } from "@/lib/metrika";

function ReferralsPageContent() {
  const {
    referralCode,
    respamTariffType,
    respamSubscriptionExpiresAt,
    hasActiveSpamSubscription,
    referrals,
    applyReferralCode,
    fetchReferralsList,
    createPayment,
    checkPaymentStatus,
    fetchMe,
  } = useAppStore();

  const { t, language } = useTranslation();

  const [selectedPlan, setSelectedPlan] = useState<"respam" | "both">("respam");

  const planOptions = [
    {
      id: "respam",
      title: "reSpam Premium",
      desc:
        language === "en"
          ? "Wildberries chats automation"
          : "Автоматизация рассылок и чатов",
      price: "490 ₽",
      amount: "490.00",
    },
    {
      id: "both",
      title: "reAnswer + reSpam Combo",
      desc:
        language === "en"
          ? "Reviews + chats automation bundle"
          : "Комбо: Отзывы + чаты Wildberries",
      price: "1190 ₽",
      amount: "1190.00",
      badge: language === "en" ? "Profitable" : "Выгодно",
    },
  ];

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [refInput, setRefInput] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState("");

  // Payment verification state
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentVerifyStatus, setPaymentVerifyStatus] = useState<
    "checking" | "success" | "error" | ""
  >("");

  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const mockPaymentId = searchParams.get("mock_payment_id");
  const paymentCheck = searchParams.get("payment_check");

  useEffect(() => {
    void fetchReferralsList();
  }, [fetchReferralsList]);

  // Check URL payment parameters on load
  useEffect(() => {
    const checkId = paymentId || mockPaymentId;
    if (checkId) {
      setPaymentVerifying(true);
      setPaymentVerifyStatus("checking");

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await checkPaymentStatus(checkId);
          if (res.success) {
            clearInterval(interval);
            setPaymentVerifying(false);
            setPaymentVerifyStatus("success");
            if (res.isFirstPayment) {
              trackMetrikaGoal("firstPayment", `firstPayment:${checkId}`);
            }
            setPurchaseSuccessMsg(t("referrals.purchaseSuccess"));
            void confetti({
              particleCount: 150,
              spread: 80,
              colors: ["#6366f1", "#a855f7", "#ec4899"],
            });
            // Strip parameters from URL
            window.history.replaceState(null, "", window.location.pathname);
          } else if (attempts >= 6) {
            clearInterval(interval);
            setPaymentVerifying(false);
            setPaymentVerifyStatus("error");
          }
        } catch (e) {
          if (attempts >= 6) {
            clearInterval(interval);
            setPaymentVerifying(false);
            setPaymentVerifyStatus("error");
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    } else if (paymentCheck) {
      setPaymentVerifying(true);
      setPaymentVerifyStatus("checking");
      void fetchMe().then(() => {
        setPaymentVerifying(false);
        setPaymentVerifyStatus("");
        window.history.replaceState(null, "", window.location.pathname);
      });
    }
  }, [paymentId, mockPaymentId, paymentCheck, checkPaymentStatus, fetchMe, t]);

  // Calculations for subscription remaining days
  const getDaysInfo = () => {
    if (!respamSubscriptionExpiresAt) return { days: 0, status: "none" };
    const expiry = new Date(respamSubscriptionExpiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: Math.abs(diffDays),
      status: diffDays > 0 ? "active" : "expired",
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
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://spam.reanswer.ru";
      const isSpamApp = checkIsSpamApp();
      const link = isSpamApp
        ? `${origin}/?ref=${referralCode}&source=respam`
        : `${origin}/spam?ref=${referralCode}&source=respam`;
      void navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleApplyReferral = async () => {
    if (!refInput.trim()) return;
    setLoadingCode(true);
    setCodeError("");
    setCodeSuccess("");
    try {
      await applyReferralCode(refInput.trim(), "respam");
      setCodeSuccess(t("referrals.successApplied"));
      setRefInput("");
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setCodeError(err.message || t("referrals.invalidCode"));
    } finally {
      setLoadingCode(false);
    }
  };

  const handleBuySubscription = async () => {
    setPurchasing(true);
    setPurchaseSuccessMsg("");
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:8082";
      const isSpamApp = checkIsSpamApp();
      const returnUrl = isSpamApp
        ? `${origin}/tariffs`
        : `${origin}/spam/tariffs`;
      const selected = planOptions.find((o) => o.id === selectedPlan);
      const res = await createPayment(
        selected?.amount || "490.00",
        returnUrl,
        selectedPlan,
      );

      if (res.confirmation_url) {
        window.location.href = res.confirmation_url;
      } else {
        throw new Error("Failed to get checkout link");
      }
    } catch (err: any) {
      alert(err.message || t("referrals.paymentFailed"));
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Gift className="text-violet-600" size={32} />
          {t("referrals.title")}
        </h1>
        <p className="text-slate-500 font-medium mt-1">{t("referrals.sub")}</p>
      </div>

      {paymentVerifying && (
        <Card className="border-2 border-violet-100 bg-violet-50/50 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
            <div>
              <p className="font-extrabold text-slate-800">
                {language === "ru"
                  ? "Проверка статуса оплаты..."
                  : "Verifying payment status..."}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {language === "ru"
                  ? "Пожалуйста, подождите, мы активируем ваш премиум-тариф..."
                  : "Please wait, we are activating your premium plan..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentVerifyStatus === "success" && (
        <Card className="border-2 border-emerald-200 bg-emerald-50 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Check size={24} className="stroke-[3]" />
            </div>
            <div>
              <p className="font-extrabold text-emerald-800 text-lg">
                {language === "ru"
                  ? "Оплата успешно подтверждена!"
                  : "Payment verified successfully!"}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                {t("referrals.purchaseSuccess")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentVerifyStatus === "error" && (
        <Card className="border-2 border-rose-200 bg-rose-50 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <AlertCircle size={24} className="stroke-[3]" />
            </div>
            <div>
              <p className="font-extrabold text-rose-800 text-lg">
                {language === "ru"
                  ? "Не удалось подтвердить оплату"
                  : "Could not verify payment"}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                {language === "ru"
                  ? "Если деньги были списаны, пожалуйста, обратитесь в поддержку или обновите страницу."
                  : "If funds were charged, please contact support or refresh the page."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid: Subscription & Invite Friends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Status Card */}
        <Card className="border border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl relative">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <CreditCard className="text-violet-600" size={20} />
              {t("referrals.subscriptionStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between h-72">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {t("referrals.currentPlan")}
                  </p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {!hasActiveSpamSubscription
                      ? t("subscription.expiredPlan")
                      : respamTariffType === "trial"
                        ? t("subscription.trialPlan")
                        : t("subscription.premiumPlan")}
                  </h3>
                </div>
                <div>
                  {!hasActiveSpamSubscription ? (
                    <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {t("referrals.expired")}
                    </span>
                  ) : respamTariffType === "trial" ? (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm animate-pulse">
                      {t("referrals.trialActive")}
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-violet-500/25">
                      {t("referrals.premium")}
                    </span>
                  )}
                </div>
              </div>

              {respamSubscriptionExpiresAt ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>
                      {daysInfo.status === "active"
                        ? t("subscription.activeDaysLeft").replace(
                            "{{days}}",
                            String(daysInfo.days),
                          )
                        : t("subscription.expiredDaysAgo").replace(
                            "{{days}}",
                            String(daysInfo.days),
                          )}
                    </span>
                    <span className="text-slate-400">
                      {t("referrals.expiryLabel")}:{" "}
                      {formatDateTime(respamSubscriptionExpiresAt)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        !hasActiveSpamSubscription
                          ? "bg-red-400"
                          : respamTariffType === "trial"
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-violet-500 to-indigo-600"
                      }`}
                      style={{
                        width: !hasActiveSpamSubscription
                          ? "100%"
                          : `${Math.min(100, (daysInfo.days / 30) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-sm font-medium text-slate-600">
                    {t("referrals.noActivePlanHintSpam")}
                  </p>
                </div>
              )}
            </div>

            {respamTariffType === "trial" && hasActiveSpamSubscription && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center gap-2">
                <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                <p className="text-sm font-semibold text-amber-800">
                  {t("referrals.trialLimitationsSpam")}
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
              {t("referrals.inviteFriends")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 h-72 flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                {t("referrals.rewardsDescSpam")}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t("referrals.referralCode")}
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="gap-1.5 text-xs shrink-0 shadow-sm"
                    style={{ padding: "12px 20px", marginTop: "0.375rem" }}
                  >
                    {copiedLink ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copiedLink
                      ? t("referrals.copied")
                      : t("referrals.copyLink")}
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
        <Card className="border border-violet-200 shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-violet-50/40 via-purple-50/20 to-white relative">
          {/* Subtle sparkles badge */}
          <div className="absolute top-4 right-4 bg-violet-100 text-violet-800 border border-violet-200 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <Sparkles size={10} />
            {t("referrals.bestOffer")}
          </div>

          <CardHeader className="border-b border-violet-100 bg-violet-50/30 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-violet-600" size={20} />
              {t("referrals.buyTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              {t("referrals.buyDesc")}
            </p>

            {/* Visual selector for plan options */}
            <div className="space-y-3 mb-6">
              {planOptions.map((option) => {
                const isProfitable = !!option.badge;
                const isSelected = selectedPlan === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedPlan(option.id as any)}
                    style={isProfitable ? { borderWidth: "2px" } : {}}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center relative overflow-hidden ${
                      isProfitable
                        ? isSelected
                          ? "border-[#2530D9] bg-[linear-gradient(150deg,#f4f6ff_0%,#ffffff_55%,#eef1ff_100%)] shadow-[0_8px_24px_rgba(37,48,217,0.18),0_0_0_1px_rgba(37,48,217,0.14)]"
                          : "border-[#2530D9] bg-[linear-gradient(150deg,#f4f6ff_0%,#ffffff_55%,#eef1ff_100%)] shadow-[0_4px_16px_rgba(37,48,217,0.12),0_0_0_1px_rgba(37,48,217,0.1)] hover:shadow-[0_8px_24px_rgba(37,48,217,0.2)]"
                        : isSelected
                          ? "border-violet-600 bg-violet-50/40"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {option.badge && (
                      <div className="absolute -top-px right-3 translate-y-0 inline-flex items-center gap-1 whitespace-nowrap rounded-b-lg bg-[linear-gradient(135deg,#2530D9_0%,#4f5be8_100%)] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_4px_10px_rgba(37,48,217,0.4)]">
                        {option.badge}
                      </div>
                    )}
                    <div>
                      <p className={`font-extrabold text-sm ${isProfitable ? "text-[#0A192F]" : "text-slate-800"}`}>
                        {option.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {option.desc}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-lg ${isProfitable ? "text-[#2530D9]" : "text-slate-900"}`}>
                        {option.price}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        {t("referrals.buyPeriod")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleBuySubscription}
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-xl shadow-violet-600/20 transition-all active:scale-95 text-sm mt-3"
            >
              <CreditCard size={18} />
              {purchasing ? t("referrals.processing") : t("referrals.buyBtn")}
              <ArrowRight size={16} />
            </Button>

            {purchaseSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
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
              <Gift className="text-rose-500" size={20} />
              {t("referrals.friendsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {referrals && referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">{t("referrals.friendName")}</th>
                      <th className="px-6 py-4">
                        {t("referrals.friendEmail")}
                      </th>
                      <th className="px-6 py-4">
                        {t("referrals.friendStatus")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((friend: any) => (
                      <tr
                        key={friend.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                          {friend.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold text-xs">
                          {friend.email}
                        </td>
                        <td className="px-6 py-4">
                          {friend.referral_source === "respam" ? (
                            friend.respam_trial_activated ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
                                {t("referrals.friendTrialStarted")}
                              </span>
                            ) : (
                              <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
                                {t("referrals.friendNoTrial")}
                              </span>
                            )
                          ) : friend.trial_activated ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
                              {t("referrals.friendTrialStarted")}
                            </span>
                          ) : (
                            <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
                              {t("referrals.friendNoTrial")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <Gift className="text-slate-300" size={48} />
                <div className="max-w-xs">
                  <p className="font-extrabold text-slate-800 text-sm">
                    {t("referrals.noReferralsYet")}
                  </p>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-semibold">
                    {t("referrals.noFriendsYet")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReferralsPageContent />
    </Suspense>
  );
}
