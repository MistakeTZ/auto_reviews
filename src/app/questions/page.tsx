"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Loader2, RotateCw } from "lucide-react";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppStore } from "@/store/useAppStore";
import { formatDateTime } from "@/lib/formatDateTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const PAGE_SIZE = 10;

type QuestionItem = {
  id: string;
  nm_id?: string | null;
  product_name?: string | null;
  text: string;
  answer_text?: string | null;
  date?: string | null;
  is_answered: boolean;
  user_name?: string | null;
};

type StatusFilter = "all" | "answered" | "unanswered";
type TriFilter = "all" | "yes" | "no";

export default function QuestionsPage() {
  const jwtToken = useAppStore((state) => state.jwtToken);
  const { t } = useTranslation();

  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [withAnswerFilter, setWithAnswerFilter] = useState<TriFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadQuestions = useCallback(async () => {
    if (!jwtToken) {
      setAllQuestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/questions/?include_answered=true&take=100`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        setAllQuestions([]);
        return;
      }

      const data = await res.json();
      setAllQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAllQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSync = async () => {
    setIsSyncing(true);
    setCurrentPage(1);
    try {
      if (!jwtToken) {
        setAllQuestions([]);
        return;
      }

      const res = await fetch(`${API_URL}/questions/sync?include_answered=true&take=100`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAllQuestions(Array.isArray(data) ? data : []);
      } else {
        await loadQuestions();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const matchesTriFilter = (value: boolean, filterValue: TriFilter) => {
    if (filterValue === "all") return true;
    if (filterValue === "yes") return value;
    return !value;
  };

  const filteredQuestions = useMemo(() => {
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return allQuestions.filter((question) => {
      const hasAnswer = Boolean((question.answer_text || "").trim());
      const questionDate = parseDate(question.date);

      if (statusFilter === "answered" && !question.is_answered) return false;
      if (statusFilter === "unanswered" && question.is_answered) return false;

      if (productFilter !== "all") {
        const productName = question.product_name || "";
        if (productName !== productFilter) return false;
      }

      if (!matchesTriFilter(hasAnswer, withAnswerFilter)) return false;

      if (fromDate || toDate) {
        if (!questionDate) return false;
        if (fromDate && questionDate < fromDate) return false;
        if (toDate && questionDate > toDate) return false;
      }

      return true;
    });
  }, [allQuestions, statusFilter, productFilter, withAnswerFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredQuestions.slice(start, end);
  }, [filteredQuestions, safeCurrentPage]);

  useEffect(() => {
    if (safeCurrentPage !== currentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [safeCurrentPage, currentPage]);

  const productOptions = useMemo(() => {
    return Array.from(
      new Set(allQuestions.map((q) => q.product_name).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));
  }, [allQuestions]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count += 1;
    if (productFilter !== "all") count += 1;
    if (withAnswerFilter !== "all") count += 1;
    if (dateFrom) count += 1;
    if (dateTo) count += 1;
    return count;
  }, [statusFilter, productFilter, withAnswerFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setStatusFilter("all");
    setProductFilter("all");
    setWithAnswerFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  return (
    <SubscriptionGuard>
      <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {t("questions.title")}
            </h1>
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-bold text-indigo-600 border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : (
                <RotateCw className="h-4 w-4 text-indigo-600" />
              )}
              {isSyncing ? t("questions.syncing") : t("questions.syncQuestions")}
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterMenuOpen((prev) => !prev)}
              className="h-9 px-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
            >
              {t("questions.filters")}
              {activeFiltersCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-[22rem] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur sm:w-[28rem]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black tracking-wide text-slate-800">
                    {t("questions.filters")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("questions.filterStatus")}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as StatusFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">{t("questions.all")}</option>
                      <option value="answered">{t("questions.answered")}</option>
                      <option value="unanswered">{t("questions.unanswered")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("questions.filterWithAnswer")}
                    </label>
                    <select
                      value={withAnswerFilter}
                      onChange={(e) => {
                        setWithAnswerFilter(e.target.value as TriFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">{t("questions.all")}</option>
                      <option value="yes">{t("questions.yes")}</option>
                      <option value="no">{t("questions.no")}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("questions.filterProduct")}
                    </label>
                    <select
                      value={productFilter}
                      onChange={(e) => {
                        setProductFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">{t("questions.all")}</option>
                      {productOptions.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("questions.filterDateFrom")}
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("questions.filterDateTo")}
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="h-8 px-3 text-xs font-bold"
                  >
                    {t("questions.resetFilters")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="h-8 px-3 text-xs font-bold"
                  >
                    {t("questions.closeFilters")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-semibold">{t("questions.loading")}</p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {paginatedQuestions.map((question) => {
                const hasAnswer = Boolean((question.answer_text || "").trim());

                return (
                  <Card key={question.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {question.user_name
                              ? `${question.user_name} • ${question.product_name || "-"}`
                              : question.product_name || "-"}
                          </h3>
                          <span className="text-xs font-semibold text-slate-400 mt-2 inline-block">
                            {question.date ? formatDateTime(question.date) : "-"}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                            question.is_answered
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {question.is_answered
                            ? t("questions.answered")
                            : t("questions.unanswered")}
                        </span>
                      </div>

                      <div className="text-slate-700 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                        <p>
                          <span className="font-bold text-slate-800">
                            {t("questions.questionLabel")}
                          </span>{" "}
                          {question.text || "-"}
                        </p>
                      </div>

                      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1.5">
                          {t("questions.answerLabel")}
                        </p>
                        <p className="text-sm text-slate-800 font-medium">
                          {hasAnswer ? question.answer_text : t("questions.noAnswer")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {paginatedQuestions.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-300">
                  {t("questions.noQuestions")}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  ← {t("questions.back")}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-sm ${
                      safeCurrentPage === p
                        ? "bg-indigo-600 text-white shadow-indigo-200"
                        : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  {t("questions.next")} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SubscriptionGuard>
  );
}