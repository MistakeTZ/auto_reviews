"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  RotateCw,
  SendHorizontal,
  WandSparkles,
  X,
  Filter,
  MessageSquare,
  ShoppingBag,
  Reply,
  Calendar,
  Pencil,
} from "lucide-react";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppStore } from "@/store/useAppStore";
import { formatDateTime } from "@/lib/formatDateTime";
import "./questions.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const PAGE_SIZE = 10;

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

type StatusFilter =
  | "all"
  | "answered"
  | "answeredGlobal"
  | "answeredPrivate"
  | "unanswered";
type TriFilter = "all" | "yes" | "no";

export default function QuestionsPage() {
  const jwtToken = useAppStore((state) => state.jwtToken);
  const products = useAppStore((state) => state.products);
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

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyState, setReplyState] = useState<{
    [key: string]: "none" | "wbRu";
  }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});
  const [isGeneratingReply, setIsGeneratingReply] = useState<{
    [key: string]: boolean;
  }>({});
  const [isEditingAnswer, setIsEditingAnswer] = useState<{
    [key: string]: boolean;
  }>({});

  const replyTextareaRefs = useRef<{
    [key: string]: HTMLTextAreaElement | null;
  }>({});

  const resizeReplyTextarea = useCallback((id: string) => {
    const el = replyTextareaRefs.current[id];
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text || !text.trim()) return;

    const state = replyState[id] || "none";

    setIsReplying((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_URL}/questions/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ text, state }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to submit reply");
      }

      const updatedQuestion = await res.json();

      setAllQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...updatedQuestion,
                is_answered: true,
              }
            : q,
        ),
      );

      setReplyText((prev) => ({ ...prev, [id]: "" }));
      setIsEditingAnswer((prev) => ({ ...prev, [id]: false }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while sending reply");
    } finally {
      setIsReplying((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleEditAnswer = (
    id: string,
    currentAnswerText: string,
    currentState: string,
  ) => {
    setReplyText((prev) => ({ ...prev, [id]: currentAnswerText }));
    setReplyState((prev) => ({
      ...prev,
      [id]: (currentState as "none" | "wbRu") || "none",
    }));
    setIsEditingAnswer((prev) => ({ ...prev, [id]: true }));
  };

  const handleGenerateReply = async (id: string) => {
    setIsGeneratingReply((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(
        `${API_URL}/questions/${encodeURIComponent(id)}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to generate reply");
      }

      const data = await res.json();
      const text = String(data?.text || "").trim();
      if (!text) {
        throw new Error("Failed to generate reply");
      }

      setReplyText((prev) => ({ ...prev, [id]: text }));
      requestAnimationFrame(() => resizeReplyTextarea(id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while generating reply");
    } finally {
      setIsGeneratingReply((prev) => ({ ...prev, [id]: false }));
    }
  };

  const loadQuestions = useCallback(async () => {
    if (!jwtToken) {
      setAllQuestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/questions/?include_answered=true&take=100`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

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

  const filteredQuestions = useMemo(() => {
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return allQuestions.filter((question) => {
      const resolvedProductName =
        productNamesByNmId[String(question.nm_id || "")] ||
        question.product_name ||
        "";
      const hasAnswer = Boolean((question.answer_text || "").trim());
      const questionDate = parseDate(question.date);

      if (statusFilter === "answered" && !question.is_answered) return false;
      if (
        statusFilter === "answeredGlobal" &&
        (!question.is_answered || question.state !== "wbRu")
      )
        return false;
      if (
        statusFilter === "answeredPrivate" &&
        (!question.is_answered || question.state !== "none")
      )
        return false;
      if (statusFilter === "unanswered" && question.is_answered) return false;

      if (productFilter !== "all") {
        if (resolvedProductName !== productFilter) return false;
      }

      if (!matchesTriFilter(hasAnswer, withAnswerFilter)) return false;

      if (fromDate || toDate) {
        if (!questionDate) return false;
        if (fromDate && questionDate < fromDate) return false;
        if (toDate && questionDate > toDate) return false;
      }

      return true;
    });
  }, [
    allQuestions,
    statusFilter,
    productFilter,
    withAnswerFilter,
    dateFrom,
    dateTo,
    productNamesByNmId,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / PAGE_SIZE),
  );
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
      new Set(
        allQuestions
          .map(
            (q) =>
              productNamesByNmId[String(q.nm_id || "")] || q.product_name || "",
          )
          .filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [allQuestions, productNamesByNmId]);

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

  const activeTags = useMemo(() => {
    const tags: { id: string; label: string; onClear: () => void }[] = [];

    if (statusFilter !== "all") {
      tags.push({
        id: "status",
        label:
          statusFilter === "answered"
            ? t("questions.answered")
            : statusFilter === "answeredGlobal"
              ? t("questions.answeredGlobal")
              : statusFilter === "answeredPrivate"
                ? t("questions.answeredPrivate")
                : t("questions.unanswered"),
        onClear: () => {
          setStatusFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (productFilter !== "all") {
      tags.push({
        id: "product",
        label:
          productFilter.length > 15
            ? `${productFilter.slice(0, 15)}...`
            : productFilter,
        onClear: () => {
          setProductFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (withAnswerFilter !== "all") {
      tags.push({
        id: "with-answer",
        label:
          withAnswerFilter === "yes" ? t("questions.yes") : t("questions.no"),
        onClear: () => {
          setWithAnswerFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (dateFrom || dateTo) {
      let dateLabel = "";
      if (dateFrom && dateTo) {
        dateLabel = `${dateFrom} - ${dateTo}`;
      } else if (dateFrom) {
        dateLabel = `С ${dateFrom}`;
      } else {
        dateLabel = `По ${dateTo}`;
      }

      tags.push({
        id: "date",
        label: dateLabel,
        onClear: () => {
          setDateFrom("");
          setDateTo("");
          setCurrentPage(1);
        },
      });
    }

    return tags;
  }, [statusFilter, productFilter, withAnswerFilter, dateFrom, dateTo, t]);

  return (
    <SubscriptionGuard>
      <div className="questions-page pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto">
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
              {isSyncing
                ? t("questions.syncing")
                : t("questions.syncQuestions")}
            </Button>
          </div>

          <div className="relative shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsFilterMenuOpen(true)}
              className="h-9 px-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 active:scale-98 transition-all shrink-0 cursor-pointer"
            >
              <Filter size={15} className="text-indigo-600" />
              <span>{t("questions.filters")}</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {isFilterMenuOpen && (
              <>
                <div
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="questions-filter-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
                />
                <div className="questions-filter-drawer fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-white z-50 flex flex-col shadow-2xl overflow-hidden [color-scheme:light]">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-black text-slate-900">
                      {t("questions.filters")}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title={t("questions.closeFilters")}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                          <MessageSquare size={16} />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          {t("questions.filterStatus")}
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value as StatusFilter);
                            setCurrentPage(1);
                          }}
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10 font-semibold text-slate-800"
                        >
                          <option value="all">{t("questions.all")}</option>
                          <option value="answered">
                            {t("questions.answered")}
                          </option>
                          <option value="answeredGlobal">
                            {t("questions.answeredGlobal")}
                          </option>
                          <option value="answeredPrivate">
                            {t("questions.answeredPrivate")}
                          </option>
                          <option value="unanswered">
                            {t("questions.unanswered")}
                          </option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg
                            className="h-4 w-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                          <ShoppingBag size={16} />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          {t("questions.filterProduct")}
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          value={productFilter}
                          onChange={(e) => {
                            setProductFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10 font-semibold text-slate-800"
                        >
                          <option value="all">{t("questions.all")}</option>
                          {productOptions.map((product) => (
                            <option key={product} value={product}>
                              {product}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg
                            className="h-4 w-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="p-1 rounded bg-sky-50 text-sky-600">
                            <Reply size={14} className="scale-x-[-1]" />
                          </div>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">
                            {t("questions.filterWithAnswer")}
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            value={withAnswerFilter}
                            onChange={(e) => {
                              setWithAnswerFilter(e.target.value as TriFilter);
                              setCurrentPage(1);
                            }}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-8 font-semibold text-slate-800"
                          >
                            <option value="all">{t("questions.all")}</option>
                            <option value="yes">{t("questions.yes")}</option>
                            <option value="no">{t("questions.no")}</option>
                          </select>
                          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg
                              className="h-3 w-3 fill-current"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="p-1 rounded bg-sky-50 text-sky-600">
                            <Calendar size={14} />
                          </div>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                            {t("questions.filterDateFrom").replace(" с", "")}
                          </span>
                        </div>
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                          <div className="relative flex-1 min-w-0">
                            <input
                              type={dateFrom ? "date" : "text"}
                              placeholder="От"
                              onFocus={(e) => (e.target.type = "date")}
                              onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                              }}
                              value={dateFrom}
                              onChange={(e) => {
                                setDateFrom(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full min-w-0 h-10 px-3 py-1.5 text-xs outline-none bg-transparent font-semibold text-slate-800 cursor-pointer [color-scheme:light] border-0 focus:ring-0"
                            />
                          </div>
                          <div className="w-[1px] h-6 bg-slate-200 shrink-0" />
                          <div className="relative flex-1 min-w-0">
                            <input
                              type={dateTo ? "date" : "text"}
                              placeholder="до"
                              onFocus={(e) => (e.target.type = "date")}
                              onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                              }}
                              value={dateTo}
                              onChange={(e) => {
                                setDateTo(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full min-w-0 h-10 px-3 py-1.5 text-xs outline-none bg-transparent font-semibold text-slate-800 cursor-pointer [color-scheme:light] border-0 focus:ring-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeTags.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            {t("questions.activeFilters")}
                          </span>
                          <span className="inline-flex h-5 items-center justify-center rounded-full bg-indigo-50 px-2 text-[10px] font-black text-indigo-600 border border-indigo-100">
                            {activeTags.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                            >
                              <span>{tag.label}</span>
                              <button
                                type="button"
                                onClick={tag.onClear}
                                className="p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                title="Remove"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-800 active:scale-98 transition-all text-xs font-bold cursor-pointer bg-white"
                    >
                      <RotateCw size={14} className="text-slate-500" />
                      <span>{t("questions.resetFilters")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="flex-[2] flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold shadow-md shadow-indigo-100 active:scale-98 transition-all text-xs cursor-pointer"
                    >
                      <span>{t("questions.showQuestionsBtn")}</span>
                      <span className="bg-indigo-500/80 px-2 py-0.5 rounded-full text-[10px] font-black text-white">
                        {filteredQuestions.length}
                      </span>
                    </button>
                  </div>
                </div>
              </>
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
                const resolvedProductName =
                  productNamesByNmId[String(question.nm_id || "")] ||
                  question.product_name ||
                  "-";

                return (
                  <Card key={question.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {question.user_name
                              ? `${question.user_name} • ${resolvedProductName}`
                              : resolvedProductName}
                          </h3>
                          <span className="text-xs font-semibold text-slate-400 mt-2 inline-block">
                            {question.date
                              ? formatDateTime(question.date)
                              : "-"}
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

                      {hasAnswer && !isEditingAnswer[question.id] && (
                        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                              {question.state === "wbRu"
                                ? t("questions.answerLabelGlobal")
                                : t("questions.answerLabelPrivate")}
                            </p>
                            {question.editable !== false && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditAnswer(
                                    question.id,
                                    String(question.answer_text || ""),
                                    String(question.state || "none"),
                                  )
                                }
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                aria-label="Edit answer"
                                title="Edit answer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-800 font-medium">
                            {question.answer_text}
                          </p>
                        </div>
                      )}

                      {(!hasAnswer || isEditingAnswer[question.id]) && (
                        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                              {t("questions.replyStateLabel")}
                            </span>
                            <div className="flex rounded-xl bg-slate-100 p-1 max-w-md">
                              <button
                                type="button"
                                onClick={() =>
                                  setReplyState((prev) => ({
                                    ...prev,
                                    [question.id]: "none",
                                  }))
                                }
                                className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  (replyState[question.id] || "none") === "none"
                                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {t("questions.replyStatePrivate")}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setReplyState((prev) => ({
                                    ...prev,
                                    [question.id]: "wbRu",
                                  }))
                                }
                                className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  replyState[question.id] === "wbRu"
                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                                    : "text-slate-500 hover:text-indigo-600"
                                }`}
                              >
                                {t("questions.replyStateGlobal")}
                              </button>
                            </div>
                          </div>

                          <div className="relative w-full">
                            <textarea
                              rows={1}
                              ref={(el) => {
                                replyTextareaRefs.current[question.id] = el;
                                if (el) {
                                  resizeReplyTextarea(question.id);
                                }
                              }}
                              value={replyText[question.id] || ""}
                              onChange={(e) => {
                                setReplyText((prev) => ({
                                  ...prev,
                                  [question.id]: e.target.value,
                                }));
                                requestAnimationFrame(() =>
                                  resizeReplyTextarea(question.id),
                                );
                              }}
                              placeholder={t("questions.typeReply")}
                              className="questions-reply-textarea w-full p-0 pr-14 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow resize-none leading-5 min-h-[44px]"
                              disabled={isReplying[question.id]}
                            />
                            <div className="absolute right-1.5 top-1.5 flex shrink-0 flex-col items-center gap-1.5">
                              <Button
                                variant="outline"
                                onClick={() => handleGenerateReply(question.id)}
                                disabled={
                                  isReplying[question.id] ||
                                  isGeneratingReply[question.id]
                                }
                                className="h-9 w-9 rounded-lg cursor-pointer p-0"
                                aria-label={t("questions.generateReply")}
                                title={t("questions.generateReply")}
                              >
                                {isGeneratingReply[question.id]
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <WandSparkles className="h-4 w-4" />}
                              </Button>
                              <Button
                                onClick={() => handleReply(question.id)}
                                disabled={
                                  !(replyText[question.id] || "").trim() ||
                                  isReplying[question.id] ||
                                  isGeneratingReply[question.id]
                                }
                                className="h-9 w-9 rounded-lg font-bold cursor-pointer p-0"
                                aria-label={t("questions.sendReply")}
                                title={t("questions.sendReply")}
                              >
                                {isReplying[question.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <SendHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                              {isEditingAnswer[question.id] && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setIsEditingAnswer((prev) => ({
                                      ...prev,
                                      [question.id]: false,
                                    }))
                                  }
                                  className="h-9 w-9 rounded-lg cursor-pointer shrink-0 border border-slate-200 text-slate-500 hover:bg-slate-50 p-0"
                                  disabled={
                                    isReplying[question.id] ||
                                    isGeneratingReply[question.id]
                                  }
                                  aria-label={t("common.cancel")}
                                  title={t("common.cancel")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  ← {t("questions.back")}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
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
                  ),
                )}

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
