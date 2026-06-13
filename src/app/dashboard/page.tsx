"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Activity,
  CircleHelp,
  MessageCircle,
  CheckCircle,
  Clock,
  RotateCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { formatDateTime } from "@/lib/formatDateTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type QuestionItem = {
  id: string;
  nm_id?: string | null;
  product_name?: string | null;
  text: string;
  answer_text?: string | null;
  date?: string | null;
  editable?: boolean | null;
  state?: string | null;
  is_answered: boolean;
  user_name?: string | null;
};

export default function Dashboard() {
  const reviews = useAppStore((state) => state.reviews);
  const rules = useAppStore((state) => state.rules);
  const products = useAppStore((state) => state.products);
  const jwtToken = useAppStore((state) => state.jwtToken);
  const syncReviews = useAppStore((state) => state.syncReviews);
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingQuestions, setIsSyncingQuestions] = useState(false);

  const loadQuestions = useCallback(async () => {
    if (!jwtToken) {
      setQuestions([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/questions/?include_answered=true`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) {
        setQuestions([]);
        return;
      }
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    }
  }, [jwtToken]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const getNormalizedStatus = (status?: string, autoAnswerText?: string) => {
    if (status === "auto-answered") return "auto";
    if (status === "manual-review") return "manually";
    if (status === "none" || status === "pending" || status === "fetched") {
      if ((autoAnswerText || "").trim()) return "manually";
    }
    if (status === "none") return "none";
    return status || "pending";
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncQuestions = async () => {
    if (!jwtToken) {
      setQuestions([]);
      return;
    }

    setIsSyncingQuestions(true);
    try {
      const res = await fetch(
        `${API_URL}/questions/sync?include_answered=true&take=100`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      } else {
        await loadQuestions();
      }
    } catch (err) {
      console.error(err);
      await loadQuestions();
    } finally {
      setIsSyncingQuestions(false);
    }
  };

  const getStatusDotClass = (status?: string, autoAnswerText?: string) => {
    const normalized = getNormalizedStatus(status, autoAnswerText);
    if (normalized === "none") return "bg-gray-500 shadow-gray-200";
    if (normalized === "auto") return "bg-emerald-500 shadow-emerald-200";
    if (normalized === "fetched") return "bg-sky-500 shadow-sky-200";
    if (normalized === "manually") return "bg-violet-500 shadow-violet-200";
    return "bg-amber-500 shadow-amber-200";
  };

  const productNamesByNmId = useMemo(() => {
    const map: Record<string, string> = {};

    if (Array.isArray(products)) {
      products.forEach((product: any) => {
        const nmId = String(product?.nmId || "").trim();
        if (!nmId) return;
        map[nmId] = String(product?.name || `WB #${nmId}`);
      });
      return map;
    }

    Object.entries(products as Record<string, any>).forEach(([nmId, value]) => {
      const key = String(value?.nmId || nmId || "").trim();
      if (!key) return;
      map[key] = String(value?.name || value?.title || `WB #${key}`);
    });

    return map;
  }, [products]);

  const totalReviews = reviews.length;
  const autoAnswered = reviews.filter(
    (r) => getNormalizedStatus(r.status, r.autoAnswerText) === "auto",
  ).length;
  const pending = reviews.filter(
    (r) => getNormalizedStatus(r.status, r.autoAnswerText) === "none",
  ).length;
  const totalQuestions = questions.length;
  const unansweredQuestions = questions.filter((q) => !q.is_answered).length;
  const averageRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1);

  return (
    <SubscriptionGuard>
      <>
        <div className="pt-24 px-4 pb-8 md:p-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-8">
            {t("dashboard.overview")}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 mr-4">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("dashboard.totalReviews")}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {totalReviews}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mr-4">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("dashboard.avgRating")}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {averageRating.toFixed(1)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 mr-4">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("dashboard.pendingReply")}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {pending}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mr-4">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("dashboard.autoAnswered")}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {autoAnswered}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 mr-4">
                  <CircleHelp size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("dashboard.totalQuestions")}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {totalQuestions}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600 mr-4">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("dashboard.unansweredQuestions")}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {unansweredQuestions}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 h-8 px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50/50"
                >
                  {isSyncing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="h-3.5 w-3.5" />
                  )}
                  {isSyncing
                    ? t("dashboard.syncing")
                    : t("dashboard.syncReviews")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews
                    .slice()
                    .sort((a, b) => Number(b.date) - Number(a.date))
                    .slice(0, 5)
                    .map((review) => {
                      const resolvedProductName =
                        productNamesByNmId[String(review.nmId || "")] ||
                        review.productName ||
                        "-";
                      return (
                        <div
                          key={review.id}
                          className="flex items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                          <div
                            className={`w-2.5 h-2.5 mt-2 rounded-full mr-3 shrink-0 ${getStatusDotClass(review.status, review.autoAnswerText)} shadow-sm`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800">
                              {review.userName
                                ? `${review.userName} • ${resolvedProductName}`
                                : resolvedProductName}
                            </p>

                          {/* Multi-line comment formatting matching screenshot */}
                          {!review.text && !review.pros && !review.cons ? (
                            <p className="text-sm text-slate-400 font-semibold mt-1">
                              Без комментария
                            </p>
                          ) : (
                            <div className="text-sm text-slate-500 space-y-0.5 mt-1">
                              {review.text && (
                                <p>
                                  <span className="font-bold text-slate-600">
                                    Комментарий:
                                  </span>{" "}
                                  {review.text}
                                </p>
                              )}
                              {review.pros && (
                                <p>
                                  <span className="font-bold text-slate-600">
                                    Плюсы:
                                  </span>{" "}
                                  {review.pros}
                                </p>
                              )}
                              {review.cons && (
                                <p>
                                  <span className="font-bold text-slate-600">
                                    Минусы:
                                  </span>{" "}
                                  {review.cons}
                                </p>
                              )}
                            </div>
                          )}

                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/40 rounded-lg">
                              ⭐ {review.rating}
                            </span>
                            {review.photosCount !== undefined &&
                              review.photosCount > 0 && (
                                <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/40 rounded-lg">
                                  📷 {review.photosCount}
                                </span>
                              )}
                            {review.hasVideo && (
                              <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/40 rounded-lg">
                                🎥 1
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-400 ml-1">
                              {formatDateTime(review.date)}
                            </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle>{t("dashboard.recentQuestions")}</CardTitle>
                <Button
                  variant="outline"
                  onClick={handleSyncQuestions}
                  disabled={isSyncingQuestions}
                  className="flex items-center gap-1.5 h-8 px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50/50"
                >
                  {isSyncingQuestions ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="h-3.5 w-3.5" />
                  )}
                  {isSyncingQuestions
                    ? t("dashboard.syncing")
                    : t("dashboard.syncQuestions")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions
                    .slice()
                    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                    .slice(0, 5)
                    .map((question) => {
                      const resolvedProductName =
                        productNamesByNmId[String(question.nm_id || "")] ||
                        question.product_name ||
                        "-";
                      return (
                        <div
                          key={question.id}
                          className="flex items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                          <div
                            className={`w-2.5 h-2.5 mt-2 rounded-full mr-3 shrink-0 ${
                              question.is_answered
                                ? "bg-emerald-500 shadow-emerald-200"
                                : "bg-amber-500 shadow-amber-200"
                            } shadow-sm`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800">
                              {question.user_name
                                ? `${question.user_name} • ${resolvedProductName}`
                                : resolvedProductName}
                            </p>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {question.text || "-"}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5">
                            <span
                              className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                question.is_answered
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                                  : "bg-amber-50 text-amber-700 border-amber-200/40"
                              }`}
                            >
                              {question.is_answered
                                ? t("questions.answered")
                                : t("questions.unanswered")}
                            </span>
                            <span className="text-xs font-semibold text-slate-400 ml-1">
                              {question.date
                                ? formatDateTime(question.date)
                                : "-"}
                            </span>
                          </div>
                        </div>
                        </div>
                      );
                    })}
                  {questions.length === 0 && (
                    <p className="text-sm font-medium text-slate-500 text-center py-6">
                      {t("dashboard.noRecentQuestions")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:hidden">
              <CardHeader>
                <CardTitle>{t("dashboard.activeRules")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.filter((rule) => rule.isActive !== false).map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div
                        className="flex justify-between items-center mb-2"
                        style={{ gap: "5%" }}
                      >
                        <h4 className="font-bold text-indigo-700">
                          {rule.name}
                        </h4>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold">
                          {t("common.active")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium">
                        {t("dashboard.ifRatingIs")}{" "}
                        <span className="font-bold text-slate-800">
                          {rule.conditionRatingOperator === "less_than"
                            ? t("dashboard.lessThan")
                            : rule.conditionRatingOperator === "more_than"
                              ? t("dashboard.moreThan")
                              : t("dashboard.exactly")}{" "}
                          {rule.conditionRating} {t("dashboard.stars")}
                        </span>
                        {rule.conditionKeyword && (
                          <span>
                            {" "}
                            {t("dashboard.andContains")} &quot;
                            {rule.conditionKeyword}&quot;
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                  {rules.filter((rule) => rule.isActive !== false).length === 0 && (
                    <p className="text-sm font-medium text-slate-500 text-center py-6">
                      {t("dashboard.noActiveRules")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    </SubscriptionGuard>
  );
}
