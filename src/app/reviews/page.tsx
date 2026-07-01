"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { formatDateTime } from "@/lib/formatDateTime";
import {
  Loader2,
  Pencil,
  RotateCw,
  SendHorizontal,
  WandSparkles,
  X,
  MessageSquare,
  Star,
  ShoppingBag,
  Reply,
  Image,
  Video,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import "./reviews.css";

const getPaginationRange = (currentPage: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
  }
  return pages;
};

export default function ReviewsPage() {
  const fetchReviews = useAppStore((state) => state.fetchReviews);
  const products = useAppStore((state) => state.products);
  const markAsAnswered = useAppStore((state) => state.markReviewAsAnswered);
  const generateReviewReply = useAppStore((state) => state.generateReviewReply);
  const syncReviews = useAppStore((state) => state.syncReviews);
  const { t, language } = useTranslation();
  const PAGE_SIZE = 10;

  type ReviewFilter = "all" | "none" | "fetched" | "auto" | "manually";
  type TriFilter = "all" | "yes" | "no";

  const [statusFilter, setStatusFilter] = useState<ReviewFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    const text = replyText[id];
    if (!text || !text.trim()) return;

    setIsReplying((prev) => ({ ...prev, [id]: true }));
    try {
      await markAsAnswered(id, text);
      setAllReviews((prev) =>
        prev.map((review) =>
          String(review.id) === String(id)
            ? {
                ...review,
                status: "manual-review",
                autoAnswerText: text,
              }
            : review,
        ),
      );
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      setIsEditingAnswer((prev) => ({ ...prev, [id]: false }));
    } finally {
      setIsReplying((prev) => ({ ...prev, [id]: false }));
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

  const productsByNmId = useMemo(() => {
    type ProductMeta = { name: string; photo?: string };
    const map: Record<string, ProductMeta> = {};

    if (Array.isArray(products)) {
      products.forEach((product: any) => {
        const nmId = String(product?.nmId || "").trim();
        if (!nmId) return;
        map[nmId] = {
          name: String(product?.name || `WB #${nmId}`),
          photo: product?.photo ? String(product.photo) : undefined,
        };
      });
      return map;
    }

    Object.entries(products as Record<string, any>).forEach(([nmId, value]) => {
      const key = String(value?.nmId || nmId || "").trim();
      if (!key) return;
      map[key] = {
        name: String(value?.name || value?.title || `WB #${key}`),
        photo: value?.photo ? String(value.photo) : undefined,
      };
    });

    return map;
  }, [products]);

  const filteredReviews = useMemo(() => {
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return allReviews.filter((review) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const reviewId = String(
          review.wb_review_id || review.id || "",
        ).toLowerCase();
        const userName = String(review.userName || "").toLowerCase();
        if (!reviewId.includes(query) && !userName.includes(query)) {
          return false;
        }
      }
      const resolvedProductName =
        productsByNmId[String(review.nmId || "")]?.name || review.productName;
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
      if (
        starsFilter.length > 0 &&
        !starsFilter.includes(Number(review.rating))
      )
        return false;
      if (productFilter !== "all" && resolvedProductName !== productFilter)
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
    searchQuery,
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
    productsByNmId,
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
      new Set(
        allReviews
          .map(
            (r) =>
              productsByNmId[String(r.nmId || "")]?.name || r.productName || "",
          )
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [allReviews, productsByNmId]);

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
    setSearchQuery("");
    setCurrentPage(1);
  };

  const activeTags = useMemo(() => {
    const tags: { id: string; label: string; onClear: () => void }[] = [];

    if (statusFilter !== "all") {
      tags.push({
        id: "status",
        label: getFilterText(statusFilter),
        onClear: () => {
          setStatusFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (starsFilter.length > 0) {
      starsFilter.forEach((star) => {
        tags.push({
          id: `star-${star}`,
          label: `★ ${star}`,
          onClear: () => {
            toggleStarFilter(star);
          },
        });
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

    if (withCommentFilter !== "all") {
      tags.push({
        id: "comment",
        label:
          withCommentFilter === "yes" ? "С комментарием" : "Без комментария",
        onClear: () => {
          setWithCommentFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (withAnswerFilter !== "all") {
      tags.push({
        id: "answer",
        label: withAnswerFilter === "yes" ? "С ответом" : "Без ответа",
        onClear: () => {
          setWithAnswerFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (withPhotoFilter !== "all") {
      tags.push({
        id: "photo",
        label: withPhotoFilter === "yes" ? "С фото" : "Без фото",
        onClear: () => {
          setWithPhotoFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (withVideoFilter !== "all") {
      tags.push({
        id: "video",
        label: withVideoFilter === "yes" ? "С видео" : "Без видео",
        onClear: () => {
          setWithVideoFilter("all");
          setCurrentPage(1);
        },
      });
    }

    if (editableFilter !== "all") {
      tags.push({
        id: "editable",
        label: editableFilter === "yes" ? "Редактируемый" : "Нередактируемый",
        onClear: () => {
          setEditableFilter("all");
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
    t,
  ]);

  return (
    <SubscriptionGuard>
      <div className="reviews-page pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={t("reviews.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsFilterMenuOpen(true)}
                className="h-9 px-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 active:scale-98 transition-all shrink-0 cursor-pointer animate-fade-in"
              >
                <Filter size={15} className="text-indigo-600" />
                <span>{t("reviews.filters")}</span>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white shadow-sm shadow-indigo-200">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Custom high-performance sliding drawer */}
              {isFilterMenuOpen && (
                <>
                  <div
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="reviews-filter-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
                  />
                  <div className="reviews-filter-drawer fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-white z-50 flex flex-col shadow-2xl overflow-hidden [color-scheme:light]">
                    {/* Sticky Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                      <h2 className="text-xl font-black text-slate-900">
                        {t("reviews.filters")}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsFilterMenuOpen(false)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title={t("reviews.closeFilters")}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                      {/* Status of Review */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                            <MessageSquare size={16} />
                          </div>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            {t("reviews.filterStatus")}
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            value={statusFilter}
                            onChange={(e) =>
                              handleStatusFilterChange(
                                e.target.value as ReviewFilter,
                              )
                            }
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10 font-semibold text-slate-800"
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

                      {/* Score */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded bg-amber-50 text-amber-500">
                            <Star size={16} fill="currentColor" />
                          </div>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            {t("reviews.filterStars")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 bg-slate-50/50 border border-slate-100 p-1.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setStarsFilter([]);
                              setCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              starsFilter.length === 0
                                ? "bg-slate-200 text-slate-800 shadow-sm"
                                : "bg-white text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 border border-slate-200/60"
                            }`}
                          >
                            {t("reviews.all")}
                          </button>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isChecked = starsFilter.includes(star);
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => toggleStarFilter(star)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-indigo-50 border border-indigo-600 text-indigo-700 shadow-sm"
                                    : "bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-800"
                                }`}
                              >
                                <Star
                                  size={12}
                                  className={
                                    isChecked
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-amber-400 fill-amber-400"
                                  }
                                />
                                <span>{star}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Product */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                            <ShoppingBag size={16} />
                          </div>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            {t("reviews.filterProduct")}
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
                            <option value="all">{t("reviews.all")}</option>
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

                      {/* Tri-state row 1 */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                              <MessageSquare size={14} />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">
                              {t("reviews.filterWithComment")}
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={withCommentFilter}
                              onChange={(e) => {
                                setWithCommentFilter(
                                  e.target.value as TriFilter,
                                );
                                setCurrentPage(1);
                              }}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-8 font-semibold text-slate-800"
                            >
                              <option value="all">{t("reviews.all")}</option>
                              <option value="yes">{t("reviews.yes")}</option>
                              <option value="no">{t("reviews.no")}</option>
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
                              <Reply size={14} className="scale-x-[-1]" />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">
                              {t("reviews.filterWithAnswer")}
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={withAnswerFilter}
                              onChange={(e) => {
                                setWithAnswerFilter(
                                  e.target.value as TriFilter,
                                );
                                setCurrentPage(1);
                              }}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-8 font-semibold text-slate-800"
                            >
                              <option value="all">{t("reviews.all")}</option>
                              <option value="yes">{t("reviews.yes")}</option>
                              <option value="no">{t("reviews.no")}</option>
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
                      </div>

                      {/* Tri-state row 2 */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                              <Image size={14} />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">
                              {t("reviews.filterWithPhoto")}
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={withPhotoFilter}
                              onChange={(e) => {
                                setWithPhotoFilter(e.target.value as TriFilter);
                                setCurrentPage(1);
                              }}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-8 font-semibold text-slate-800"
                            >
                              <option value="all">{t("reviews.all")}</option>
                              <option value="yes">{t("reviews.yes")}</option>
                              <option value="no">{t("reviews.no")}</option>
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
                            <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                              <Video size={14} />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">
                              {t("reviews.filterWithVideo")}
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={withVideoFilter}
                              onChange={(e) => {
                                setWithVideoFilter(e.target.value as TriFilter);
                                setCurrentPage(1);
                              }}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-8 font-semibold text-slate-800"
                            >
                              <option value="all">{t("reviews.all")}</option>
                              <option value="yes">{t("reviews.yes")}</option>
                              <option value="no">{t("reviews.no")}</option>
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
                      </div>

                      {/* Tri-state row 3 */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                              <Pencil size={14} />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">
                              {t("reviews.filterEditable")}
                            </span>
                          </div>
                          <div className="relative">
                            <select
                              value={editableFilter}
                              onChange={(e) => {
                                setEditableFilter(e.target.value as TriFilter);
                                setCurrentPage(1);
                              }}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-8 font-semibold text-slate-800"
                            >
                              <option value="all">{t("reviews.all")}</option>
                              <option value="yes">{t("reviews.yes")}</option>
                              <option value="no">{t("reviews.no")}</option>
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
                              {t("reviews.filterDateFrom").replace(" с", "")}
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

                      {/* Active tags inside drawer body (bottom) */}
                      {activeTags.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                              {t("reviews.activeFilters")}
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

                    {/* Sticky Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="flex-1 flex items-center justify-center gap-1.5 h-11 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-800 active:scale-98 transition-all text-xs font-bold cursor-pointer bg-white"
                      >
                        <RotateCw size={14} className="text-slate-500" />
                        <span>{t("reviews.resetFilters")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFilterMenuOpen(false)}
                        className="flex-[2] flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold shadow-md shadow-indigo-100 active:scale-98 transition-all text-xs cursor-pointer"
                      >
                        <span>{t("reviews.showReviewsBtn")}</span>
                        <span className="bg-indigo-500/80 px-2 py-0.5 rounded-full text-[10px] font-black text-white">
                          {filteredReviews.length}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-semibold">{t("reviews.loading")}</p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {paginatedReviews.map((review) => {
                const isReviewEditable = review.editable !== false;
                const productMeta = productsByNmId[String(review.nmId || "")];
                const productName =
                  productMeta?.name ||
                  review.productName ||
                  `WB #${review.nmId}`;
                const productPhoto = productMeta?.photo;

                return (
                  <Card
                    key={review.id}
                    className={
                      getNormalizedStatus(
                        review.status,
                        review.autoAnswerText,
                      ) === "pending"
                        ? "border-amber-200"
                        : ""
                    }
                  >
                    <CardContent className="p-6">
                      <div className="relative mb-4 sm:flex sm:justify-between sm:items-start">
                        <div className="flex items-start">
                          {/* Orange/emerald status dot matching recent actions - Hidden on mobile */}
                          <div
                            className={`hidden sm:block w-2.5 h-2.5 mt-2 rounded-full mr-3 shrink-0 ${getStatusDotClass(review.status, review.autoAnswerText)} shadow-sm`}
                          />

                          {/* Image and Title column on mobile, row on desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 w-full">
                            {productPhoto && (
                              <img
                                src={productPhoto}
                                alt={productName}
                                className="w-12 h-16 rounded-md object-cover border border-slate-200 bg-white shrink-0 sm:mt-0.5"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div className="small-title pr-[85px] mt-1">
                              <h3 className="font-bold text-lg text-slate-900 leading-tight">
                                {review.userName
                                  ? `${review.userName} • ${productName}`
                                  : productName}
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
                        </div>

                        {/* Status Badge - Absolute on mobile, static on desktop */}
                        <div className="absolute top-0 right-0 sm:static z-10">
                          <span
                            className={`inline-block px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusBadgeClass(review.status, review.autoAnswerText)}`}
                          >
                            {getStatusLabel(
                              review.status,
                              review.autoAnswerText,
                            )}
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
                        <div className="mt-4 relative w-full">
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
                            className="reviews-reply-textarea w-full bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow resize-none leading-5 min-h-[135px]"
                            style={{ padding: "0.5rem 3.5rem 0.5rem 0.5rem" }}
                            disabled={!isReviewEditable}
                          />
                          <div className="absolute right-1.5 top-1.5 flex shrink-0 flex-col items-center gap-1.5">
                            <Button
                              variant="outline"
                              onClick={() => handleGenerateReply(review.id)}
                              disabled={
                                !isReviewEditable ||
                                isReplying[review.id] ||
                                isGeneratingReply[review.id]
                              }
                              className="h-9 w-9 rounded-lg cursor-pointer p-0"
                              aria-label={t("reviews.generateReply")}
                              title={t("reviews.generateReply")}
                            >
                              {isGeneratingReply[review.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <WandSparkles className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleReply(review.id)}
                              disabled={
                                !(replyText[review.id] || "").trim() ||
                                !isReviewEditable ||
                                isReplying[review.id] ||
                                isGeneratingReply[review.id]
                              }
                              className="h-9 w-9 rounded-lg font-bold cursor-pointer p-0"
                              aria-label={t("reviews.sendReply")}
                              title={t("reviews.sendReply")}
                            >
                              {isReplying[review.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SendHorizontal className="h-4 w-4" />
                              )}
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
                                className="h-9 w-9 rounded-lg cursor-pointer shrink-0 border border-slate-200 text-slate-500 hover:bg-slate-50 p-0"
                                disabled={
                                  isReplying[review.id] ||
                                  isGeneratingReply[review.id]
                                }
                                aria-label={t("common.cancel")}
                                title={t("common.cancel")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

                {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="px-3 py-2 text-sm font-bold text-slate-400 select-none cursor-default"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-sm ${
                        currentPage === p
                          ? "bg-indigo-600 text-white shadow-indigo-200"
                          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

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
