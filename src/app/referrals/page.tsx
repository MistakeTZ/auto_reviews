"use client";

import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
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

function ReferralsPageContent() {
  const {
    referralCode,
    tariffType,
    subscriptionExpiresAt,
    hasActiveSubscription,
    referrals,
    applyReferralCode,
    fetchReferralsList,
    createPayment,
    checkPaymentStatus,
    fetchMe,
  } = useAppStore();

  const { t } = useTranslation();

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
  const [paymentVerifyStatus, setPaymentVerifyStatus] = useState<"checking" | "success" | "error" | "">("");

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
    if (!subscriptionExpiresAt) return { days: 0, status: "none" };
    const expiry = new Date(subscriptionExpiresAt);
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
          : "https://reanswer.ru";
      const link = `${origin}/?ref=${referralCode}`;
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
      await applyReferralCode(refInput.trim());
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
      const returnUrl = `${origin}/referrals`;
      const res = await createPayment("990.00", returnUrl);
      
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Gift className="text-purple-600" size={32} />
          {t("referrals.title")}
        </h1>
        <p className="text-slate-500 font-medium mt-1">{t("referrals.sub")}</p>
      </div>

      {/* Payment Verification Alerts */}
      {paymentVerifying && (
        <Card className="border border-indigo-200 bg-indigo-50/50 backdrop-blur-xl rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Checking payment status...
            </h3>
            <p className="text-slate-500 text-xs font-semibold">
              Please wait while we verify your payment with YooKassa. This takes a few seconds.
            </p>
          </div>
        </Card>
      )}

      {paymentVerifyStatus === "success" && (
        <Card className="border border-emerald-200 bg-emerald-50/50 backdrop-blur-xl rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Check size={24} className="text-emerald-600" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Payment Successful!
            </h3>
            <p className="text-slate-500 text-xs font-semibold">
              Your premium subscription has been successfully activated. Enjoy full access!
            </p>
          </div>
        </Card>
      )}

      {paymentVerifyStatus === "error" && (
        <Card className="border border-red-200 bg-red-50/50 backdrop-blur-xl rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert size={24} className="text-red-600" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Payment verification delayed or failed
            </h3>
            <p className="text-slate-500 text-xs font-semibold">
              We couldn't verify your payment automatically. If you've been charged, please refresh the page in a few moments or contact support.
            </p>
          </div>
        </Card>
      )}

      {/* Grid: Subscription & Invite Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Status Card */}
        <Card className="border border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl relative">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={20} />
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
                    {!hasActiveSubscription
                      ? t("subscription.expiredPlan")
                      : tariffType === "trial"
                        ? t("subscription.trialPlan")
                        : t("subscription.premiumPlan")}
                  </h3>
                </div>
                <div>
                  {!hasActiveSubscription ? (
                    <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {t("referrals.expired")}
                    </span>
                  ) : tariffType === "trial" ? (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm animate-pulse">
                      {t("referrals.trialActive")}
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25">
                      {t("referrals.premium")}
                    </span>
                  )}
                </div>
              </div>

              {subscriptionExpiresAt ? (
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
                      {formatDateTime(subscriptionExpiresAt)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        !hasActiveSubscription
                          ? "bg-red-400"
                          : tariffType === "trial"
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600"
                      }`}
                      style={{
                        width: !hasActiveSubscription
                          ? "100%"
                          : `${Math.min(100, (daysInfo.days / 30) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-xs font-medium text-slate-600">
                    {t("referrals.noActivePlanHint")}
                  </p>
                </div>
              )}
            </div>

            {tariffType === "trial" && hasActiveSubscription && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center gap-2">
                <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                <p className="text-xs font-semibold text-amber-800">
                  {t("referrals.trialLimitations")}
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
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                {t("referrals.rewardsDesc")}
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
        <Card className="border border-indigo-200 shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white relative">
          {/* Subtle sparkles badge */}
          <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <Sparkles size={10} />
            {t("referrals.bestOffer")}
          </div>

          <CardHeader className="border-b border-indigo-100 bg-indigo-50/30 py-4 px-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={20} />
              {t("referrals.buyTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {t("referrals.buyDesc")}
            </p>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {t("referrals.buyPrice")}
              </span>
              <span className="text-slate-400 font-bold text-sm uppercase">
                {t("referrals.buyPeriod")}
              </span>
            </div>

            <Button
              onClick={handleBuySubscription}
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-sm mt-3"
            >
              <CreditCard size={18} />
              {purchasing ? t("referrals.processing") : t("referrals.buyBtn")}
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
              {t("referrals.friendsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {referrals && referrals.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">{t("referrals.friendName")}</th>
                      <th className="px-6 py-4 text-right">
                        {t("referrals.friendStatus")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((friend: any) => (
                      <tr
                        key={friend.id}
                        className="text-sm font-semibold hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-900">
                          {friend.name}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {friend.trial_activated ? (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-bold">
                              {t("referrals.friendTrialStarted")}
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs font-bold">
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
              <div className="text-center py-16 text-slate-500 font-medium">
                <span className="text-4xl block mb-2">👋</span>
                <p className="text-sm font-bold text-slate-700 mb-1">
                  {t("referrals.noReferralsYet")}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t("referrals.noFriendsYet")}
                </p>
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
    <Suspense fallback={<div className="pt-32 text-center text-slate-500 font-bold">Loading...</div>}>
      <ReferralsPageContent />
    </Suspense>
  );
}
