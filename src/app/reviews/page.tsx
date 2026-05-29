"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { formatDateTime } from "@/lib/formatDateTime";
import { Loader2, Pencil, RotateCw } from "lucide-react";

export default function ReviewsPage() {
  const fetchReviews = useAppStore((state) => state.fetchReviews);
  const markAsAnswered = useAppStore((state) => state.markReviewAsAnswered);
  const generateReviewReply = useAppStore((state) => state.generateReviewReply);
  const syncReviews = useAppStore((state) => state.syncReviews);
  const { t, language } = useTranslation();
  const PAGE_SIZE = 10;

  type ReviewFilter = "all" | "none" | "fetched" | "auto" | "manually";
  type TriFilter = "all" | "yes" | "no";

  const [statusFilter, setStatusFilter] = useState<ReviewFilter>("all");
  const [starsFilter, setStarsFilter] = useState<number[]>([]);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [withCommentFilter, setWithCommentFilter] = useState<TriFilter>("all");
  const [withAnswerFilter, setWithAnswerFilter] = useState<TriFilter>("all");
  const [withPhotoFilter, setWithPhotoFilter] = useState<TriFilter>("all");
  const [withVideoFilter, setWithVideoFilter] = useState<TriFilter>("all");
  const [editableFilter, setEditableFilter] = useState<TriFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [paginatedReviews, setPaginatedReviews] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState<{
    [key: string]: boolean;
  }>({});
  const [isEditingAnswer, setIsEditingAnswer] = useState<{
    [key: string]: boolean;
  }>({});
  const replyTextareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const resizeReplyTextarea = useCallback((id: string) => {
    const el = replyTextareaRefs.current[id];
    if (!el) return;

    el.style.height = "auto";
    const maxHeight = 240;
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  const getNormalizedStatus = (status?: string, autoAnswerText?: string) => {
    if (status === "auto-answered") return "auto";
    if (status === "manual-review") return "manually";
    if (status === "none" || status === "pending" || status === "fetched") {
      if ((autoAnswerText || "").trim()) return "manually";
    }
    if (status === "none") return "none";
    return status || "pending";
  };

  const loadAllReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchReviews(undefined, undefined, "all");
      if (res) {
        setAllReviews(res);
      } else {
        setAllReviews([]);
      }
    } catch (err) {
      console.error(err);
      setAllReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchReviews]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncReviews();
      setCurrentPage(1);
      await loadAllReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAllReviews();
  }, [loadAllReviews]);

  const handleStatusFilterChange = (f: ReviewFilter) => {
    setStatusFilter(f);
    setCurrentPage(1);
  };

  const toggleStarFilter = (star: number) => {
    setStarsFilter((prev) => {
      if (prev.includes(star)) {
        return prev.filter((value) => value !== star);
      }
      return [...prev, star].sort((a, b) => a - b);
    });
    setCurrentPage(1);
  };

  const handleReply = async (id: string) => {
    if (replyText[id]) {
      await markAsAnswered(id, replyText[id]);
      setAllReviews((prev) =>
        prev.map((review) =>
          String(review.id) === String(id)
            ? {
                ...review,
                status: "manual-review",
                autoAnswerText: replyText[id],
              }
            : review,
        ),
      );
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      setIsEditingAnswer((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleEditAnswer = (id: string, answerText: string) => {
    setReplyText((prev) => ({ ...prev, [id]: answerText || "" }));
    setIsEditingAnswer((prev) => ({ ...prev, [id]: true }));
  };

  const handleGenerateReply = async (id: string) => {
    setIsGeneratingReply((prev) => ({ ...prev, [id]: true }));
    try {
      const generated = await generateReviewReply(id);
      if (generated) {
        setReplyText((prev) => ({ ...prev, [id]: generated }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReply((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getFilterText = (f: ReviewFilter) => {
    if (f === "all") return t("reviews.all");
    if (f === "none") return t("reviews.none");
    if (f === "fetched") return t("reviews.fetched");
    if (f === "auto") return t("reviews.autoAnswered");
    if (f === "manually") return t("reviews.manually");
    return f;
  };

  const getStatusLabel = (status?: string, autoAnswerText?: string) => {
    const normalized = getNormalizedStatus(status, autoAnswerText);

    if (normalized === "none") return t("reviews.none");
    if (normalized === "fetched") return t("reviews.fetched");
    if (normalized === "auto") return t("reviews.autoAnswered");
    if (normalized === "manually") return t("reviews.manually");
    return t("reviews.pending");
  };

  const getStatusDotClass = (status?: string, autoAnswerText?: string) => {
    const normalized = getNormalizedStatus(status, autoAnswerText);
    if (normalized === "none") return "bg-gray-500 shadow-gray-200";
    if (normalized === "auto") return "bg-emerald-500 shadow-emerald-200";
    if (normalized === "fetched") return "bg-sky-500 shadow-sky-200";
    if (normalized === "manually") return "bg-violet-500 shadow-violet-200";
    return "bg-amber-500 shadow-amber-200";
  };

  const getStatusBadgeClass = (status?: string, autoAnswerText?: string) => {
    const normalized = getNormalizedStatus(status, autoAnswerText);
    if (normalized === "none") return "bg-gray-100 text-gray-700";
    if (normalized === "auto") return "bg-emerald-50 text-emerald-700";
    if (normalized === "fetched") return "bg-sky-50 text-sky-700";
    if (normalized === "manually") return "bg-violet-50 text-violet-700";
    return "bg-amber-50 text-amber-700";
  };

  const matchesTriFilter = (value: boolean, filterValue: TriFilter) => {
    if (filterValue === "all") return true;
    if (filterValue === "yes") return value;
    return !value;
  };

  const parseDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const filteredReviews = useMemo(() => {
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return allReviews.filter((review) => {
      const normalizedStatus = getNormalizedStatus(
        review.status,
        review.autoAnswerText,
      );
      const hasComment = Boolean(
        (review.text || "").trim() ||
        (review.pros || "").trim() ||
        (review.cons || "").trim(),
      );
      const hasAnswer = Boolean((review.autoAnswerText || "").trim());
      const hasPhoto = Number(review.photosCount || 0) > 0;
      const hasVideo = Boolean(review.hasVideo);
      const isEditable = review.editable !== false;
      const reviewDate = parseDate(review.date);

      if (statusFilter !== "all" && normalizedStatus !== statusFilter)
        return false;
      if (starsFilter.length > 0 && !starsFilter.includes(Number(review.rating)))
        return false;
      if (productFilter !== "all" && review.productName !== productFilter)
        return false;
      if (!matchesTriFilter(hasComment, withCommentFilter)) return false;
      if (!matchesTriFilter(hasAnswer, withAnswerFilter)) return false;
      if (!matchesTriFilter(hasPhoto, withPhotoFilter)) return false;
      if (!matchesTriFilter(hasVideo, withVideoFilter)) return false;
      if (!matchesTriFilter(isEditable, editableFilter)) return false;

      if (fromDate || toDate) {
        if (!reviewDate) return false;
        if (fromDate && reviewDate < fromDate) return false;
        if (toDate && reviewDate > toDate) return false;
      }

      return true;
    });
  }, [
    allReviews,
    statusFilter,
    starsFilter,
    productFilter,
    withCommentFilter,
    withAnswerFilter,
    withPhotoFilter,
    withVideoFilter,
    editableFilter,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
    setTotalPages(pages);

    const safePage = Math.min(currentPage, pages);
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
      return;
    }

    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPaginatedReviews(filteredReviews.slice(start, end));
  }, [filteredReviews, currentPage]);

  const starsOptions = useMemo(() => {
    return Array.from(
      new Set(
        allReviews.map((r) => Number(r.rating)).filter((n) => !Number.isNaN(n)),
      ),
    ).sort((a, b) => a - b);
  }, [allReviews]);

  const productOptions = useMemo(() => {
    return Array.from(
      new Set(allReviews.map((r) => r.productName).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [allReviews]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count += 1;
    if (starsFilter.length > 0) count += 1;
    if (productFilter !== "all") count += 1;
    if (withCommentFilter !== "all") count += 1;
    if (withAnswerFilter !== "all") count += 1;
    if (withPhotoFilter !== "all") count += 1;
    if (withVideoFilter !== "all") count += 1;
    if (editableFilter !== "all") count += 1;
    if (dateFrom) count += 1;
    if (dateTo) count += 1;
    return count;
  }, [
    statusFilter,
    starsFilter,
    productFilter,
    withCommentFilter,
    withAnswerFilter,
    withPhotoFilter,
    withVideoFilter,
    editableFilter,
    dateFrom,
    dateTo,
  ]);

  const resetFilters = () => {
    setStatusFilter("all");
    setStarsFilter([]);
    setProductFilter("all");
    setWithCommentFilter("all");
    setWithAnswerFilter("all");
    setWithPhotoFilter("all");
    setWithVideoFilter("all");
    setEditableFilter("all");
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
              {t("reviews.title")}
            </h1>
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-bold text-indigo-600 border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all animate-fade-in"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : (
                <RotateCw className="h-4 w-4 text-indigo-600" />
              )}
              {isSyncing ? t("reviews.syncing") : t("reviews.syncReviews")}
            </Button>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterMenuOpen((prev) => !prev)}
              className="h-9 px-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
            >
              {t("reviews.filters")}
              {activeFiltersCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-[22rem] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur sm:w-[30rem]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black tracking-wide text-slate-800">
                    {t("reviews.filters")}
                  </p>
                  {activeFiltersCount > 0 && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterStatus")}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        handleStatusFilterChange(e.target.value as ReviewFilter)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      {(
                        [
                          "all",
                          "none",
                          "fetched",
                          "auto",
                          "manually",
                        ] as const
                      ).map((f) => (
                        <option key={f} value={f}>
                          {getFilterText(f)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterStars")}
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {starsOptions.length === 0 ? (
                          <p className="col-span-3 px-1 py-2 text-xs text-slate-500">
                            {t("reviews.noReviews")}
                          </p>
                        ) : (
                          starsOptions.map((star) => {
                            const isChecked = starsFilter.includes(star);

                            return (
                              <label
                                key={star}
                                className={`flex cursor-pointer select-none items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                                  isChecked
                                    ? "border-amber-300 bg-amber-50 text-amber-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleStarFilter(star)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                />
                                <span style={{ minWidth: "30px" }}>⭐ {star}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterProduct")}
                    </label>
                    <select
                      value={productFilter}
                      onChange={(e) => {
                        setProductFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">
                        {t("reviews.all")}
                      </option>
                      {productOptions.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterWithComment")}
                    </label>
                    <select
                      value={withCommentFilter}
                      onChange={(e) => {
                        setWithCommentFilter(e.target.value as TriFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">
                        {t("reviews.all")}
                      </option>
                      <option value="yes">
                        {t("reviews.yes")}
                      </option>
                      <option value="no">
                        {t("reviews.no")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterWithAnswer")}
                    </label>
                    <select
                      value={withAnswerFilter}
                      onChange={(e) => {
                        setWithAnswerFilter(e.target.value as TriFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">
                        {t("reviews.all")}
                      </option>
                      <option value="yes">
                        {t("reviews.yes")}
                      </option>
                      <option value="no">
                        {t("reviews.no")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterWithPhoto")}
                    </label>
                    <select
                      value={withPhotoFilter}
                      onChange={(e) => {
                        setWithPhotoFilter(e.target.value as TriFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">
                        {t("reviews.all")}
                      </option>
                      <option value="yes">
                        {t("reviews.yes")}
                      </option>
                      <option value="no">
                        {t("reviews.no")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterWithVideo")}
                    </label>
                    <select
                      value={withVideoFilter}
                      onChange={(e) => {
                        setWithVideoFilter(e.target.value as TriFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">
                        {t("reviews.all")}
                      </option>
                      <option value="yes">
                        {t("reviews.yes")}
                      </option>
                      <option value="no">
                        {t("reviews.no")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterEditable")}
                    </label>
                    <select
                      value={editableFilter}
                      onChange={(e) => {
                        setEditableFilter(e.target.value as TriFilter);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 transition focus:ring-2"
                    >
                      <option value="all">
                        {t("reviews.all")}
                      </option>
                      <option value="yes">
                        {t("reviews.yes")}
                      </option>
                      <option value="no">
                        {t("reviews.no")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("reviews.filterDateFrom")}
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
                      {t("reviews.filterDateTo")}
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
                    {t("reviews.resetFilters")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="h-8 px-3 text-xs font-bold"
                  >
                    {t("reviews.closeFilters")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-semibold">
              {t("reviews.loading")}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {paginatedReviews.map((review) => {
                const isReviewEditable = review.editable !== false;

                return (
                  <Card
                    key={review.id}
                    className={
                      getNormalizedStatus(review.status, review.autoAnswerText) ===
                      "pending"
                        ? "border-amber-200"
                        : ""
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start">
                          {/* Orange/emerald status dot matching recent actions */}
                          <div
                            className={`w-2.5 h-2.5 mt-2 rounded-full mr-3 shrink-0 ${getStatusDotClass(review.status, review.autoAnswerText)} shadow-sm`}
                          />
                          <div>
                            <h3 className="font-bold text-lg text-slate-900">
                              {review.userName
                                ? `${review.userName} • ${review.productName}`
                                : review.productName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
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
                              {review.isEditedFeedback && (
                                <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/40 rounded-lg">
                                  {t("reviews.editedFeedback")}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-slate-400 ml-1">
                                {formatDateTime(review.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusBadgeClass(review.status, review.autoAnswerText)}`}
                          >
                            {getStatusLabel(review.status, review.autoAnswerText)}
                          </span>
                        </div>
                      </div>

                      {/* Screenshot-aligned comment body */}
                      <div className="text-slate-700 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                        {!review.text && !review.pros && !review.cons ? (
                          <p className="text-slate-400 italic">
                            {t("reviews.noComment")}
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {review.text && (
                              <p>
                                <span className="font-bold text-slate-800">
                                  {t("reviews.commentLabel")}
                                </span>{" "}
                                {review.text}
                              </p>
                            )}
                            {review.pros && (
                              <p>
                                <span className="font-bold text-slate-800">
                                  {t("reviews.prosLabel")}
                                </span>{" "}
                                {review.pros}
                              </p>
                            )}
                            {review.cons && (
                              <p>
                                <span className="font-bold text-slate-800">
                                  {t("reviews.consLabel")}
                                </span>{" "}
                                {review.cons}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {review.autoAnswerText && (
                        <div className="mt-5 border-t border-slate-200 pt-4">
                          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                                {t("reviews.automatedResponse")}
                              </p>
                              {isReviewEditable && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditAnswer(
                                      review.id,
                                      String(review.autoAnswerText || ""),
                                    )
                                  }
                                  className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  aria-label="Edit answer"
                                  title="Edit answer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-slate-800 font-medium">
                              {review.autoAnswerText}
                            </p>
                          </div>
                        </div>
                      )}

                      {((getNormalizedStatus(review.status) !== "auto" &&
                        !review.autoAnswerText) ||
                        isEditingAnswer[review.id]) && (
                          <div className="flex gap-3 mt-4">
                            <textarea
                              rows={1}
                              ref={(el) => {
                                replyTextareaRefs.current[review.id] = el;
                                if (el) {
                                  resizeReplyTextarea(review.id);
                                }
                              }}
                              value={replyText[review.id] || ""}
                              onChange={(e) => {
                                setReplyText((prev) => ({
                                  ...prev,
                                  [review.id]: e.target.value,
                                }));
                                requestAnimationFrame(() =>
                                  resizeReplyTextarea(review.id),
                                );
                              }}
                              placeholder={
                                isReviewEditable
                                  ? t("reviews.typeReply")
                                  : t("reviews.replyUnavailable")
                              }
                              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow resize-none leading-5 min-h-[44px]"
                              style={{ maxWidth: "calc(100% - 130px)" }}
                              disabled={!isReviewEditable}
                            />
                            <Button
                              variant="outline"
                              onClick={() => handleGenerateReply(review.id)}
                              disabled={!isReviewEditable || isGeneratingReply[review.id]}
                            >
                              {isGeneratingReply[review.id]
                                ? t("reviews.generatingReply")
                                : t("reviews.generateReply")}
                            </Button>
                            <Button
                              onClick={() => handleReply(review.id)}
                              disabled={
                                !replyText[review.id] || !isReviewEditable
                              }
                            >
                              {t("reviews.sendReply")}
                            </Button>
                            {isEditingAnswer[review.id] && (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setIsEditingAnswer((prev) => ({
                                    ...prev,
                                    [review.id]: false,
                                  }))
                                }
                              >
                                {t("common.cancel")}
                              </Button>
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
              {paginatedReviews.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-300">
                  {t("reviews.noReviews")}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  ← {t("reviews.back")}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-sm ${
                        currentPage === p
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
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  {t("reviews.next")} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SubscriptionGuard>
  );
}
