"use client";

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import SubscriptionGuard from '@/components/layout/SubscriptionGuard';
import { formatDateTime } from '@/lib/formatDateTime';
import { Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const fetchReviews = useAppStore(state => state.fetchReviews);
  const markAsAnswered = useAppStore(state => state.markReviewAsAnswered);
  const { t, language } = useTranslation();
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'auto-answered'>('all');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  const [paginatedReviews, setPaginatedReviews] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const res = await fetchReviews(currentPage, 10, filter);
        if (active && res) {
          setPaginatedReviews(res.items || []);
          setTotalPages(res.pages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchPage();
    return () => {
      active = false;
    };
  }, [currentPage, filter, fetchReviews]);

  const handleFilterChange = (f: 'all' | 'pending' | 'auto-answered') => {
    setFilter(f);
    setCurrentPage(1);
  };

  const handleReply = async (id: string) => {
    if (replyText[id]) {
      await markAsAnswered(id, replyText[id]);
      setReplyText(prev => ({ ...prev, [id]: '' }));
      // Re-fetch current page
      const res = await fetchReviews(currentPage, 10, filter);
      if (res) {
        setPaginatedReviews(res.items || []);
        setTotalPages(res.pages || 1);
      }
    }
  };

  const getFilterText = (f: string) => {
    if (f === 'all') return t('reviews.all');
    if (f === 'pending') return t('reviews.pending');
    if (f === 'auto-answered') return t('reviews.autoAnswered');
    return f;
  };

  return (
    <SubscriptionGuard>
      <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{t('reviews.title')}</h1>
          <div className="flex w-full flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto sm:flex-nowrap">
            {(['all', 'pending', 'auto-answered'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 sm:px-4 sm:text-sm ${filter === f
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {getFilterText(f)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-semibold">{language === 'ru' ? 'Загрузка отзывов...' : 'Loading reviews...'}</p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {paginatedReviews.map(review => (
                <Card key={review.id} className={review.status === 'pending' ? 'border-amber-200' : ''}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start">
                        {/* Orange/emerald status dot matching recent actions */}
                        <div className={`w-2.5 h-2.5 mt-2 rounded-full mr-3 shrink-0 ${review.status === 'auto-answered' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-amber-500 shadow-amber-200'} shadow-sm`} />
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {review.userName ? `${review.userName} | ${review.productName}` : review.productName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/40 rounded-lg">
                              ⭐ {review.rating}
                            </span>
                            {review.photosCount !== undefined && review.photosCount > 0 && (
                              <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/40 rounded-lg">
                                📷 {review.photosCount}
                              </span>
                            )}
                            {review.hasVideo && (
                              <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/40 rounded-lg">
                                🎥 1
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-400 ml-1">{formatDateTime(review.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${review.status === 'auto-answered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                          }`}>
                          {review.status === 'auto-answered' ? t('common.answered') : t('common.pending')}
                        </span>
                      </div>
                    </div>

                    {/* Screenshot-aligned comment body */}
                    <div className="text-slate-700 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                      {!review.text && !review.pros && !review.cons ? (
                        <p className="text-slate-400 italic">Без комментария</p>
                      ) : (
                        <div className="space-y-1">
                          {review.text && (
                            <p>
                              <span className="font-bold text-slate-800">Комментарий:</span> {review.text}
                            </p>
                          )}
                          {review.pros && (
                            <p>
                              <span className="font-bold text-slate-800">Плюсы:</span> {review.pros}
                            </p>
                          )}
                          {review.cons && (
                            <p>
                              <span className="font-bold text-slate-800">Минусы:</span> {review.cons}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {review.status === 'auto-answered' ? (
                      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-600 mb-1.5 uppercase tracking-wide">{t('reviews.automatedResponse')}</p>
                        <p className="text-sm text-slate-800 font-medium">{review.autoAnswerText}</p>
                      </div>
                    ) : (
                      <div className="flex gap-3 mt-4">
                        <input
                          type="text"
                          value={replyText[review.id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder={t('reviews.typeReply')}
                          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow"
                          style={{ maxWidth: "calc(100% - 130px)" }}
                        />
                        <Button onClick={() => handleReply(review.id)} disabled={!replyText[review.id]}>
                          {t('reviews.sendReply')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {paginatedReviews.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-300">
                  {t('reviews.noReviews')}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  ← {language === 'ru' ? 'Назад' : 'Back'}
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-sm ${currentPage === p
                      ? 'bg-indigo-600 text-white shadow-indigo-200'
                      : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all font-bold text-sm shadow-sm"
                >
                  {language === 'ru' ? 'Вперед' : 'Next'} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SubscriptionGuard>
  );
}