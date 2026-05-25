"use client";

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import SubscriptionGuard from '@/components/layout/SubscriptionGuard';

export default function ReviewsPage() {
  const reviews = useAppStore(state => state.reviews);
  const markAsAnswered = useAppStore(state => state.markReviewAsAnswered);
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'pending' | 'auto-answered'>('all');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const filteredReviews = reviews.filter(r => filter === 'all' || r.status === filter);

  const handleReply = (id: string) => {
    if (replyText[id]) {
      markAsAnswered(id, replyText[id]);
      setReplyText(prev => ({ ...prev, [id]: '' }));
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
      <div className="flex justify-between items-center mb-8" style={{ gap: '5%' }}>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{t('reviews.title')}</h1>
        <div className="flex space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['all', 'pending', 'auto-answered'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${filter === f
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              {getFilterText(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {filteredReviews.map(review => (
          <Card key={review.id} className={review.status === 'pending' ? 'border-amber-200' : ''}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{review.productName}</h3>
                  <div className="flex items-center mt-1.5 space-x-3 text-sm">
                    <span className="flex text-amber-400 text-lg leading-none">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="text-slate-500 font-medium">{review.date}</span>
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

              <p className="text-slate-700 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                "{review.text}"
              </p>

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
                  />
                  <Button onClick={() => handleReply(review.id)} disabled={!replyText[review.id]}>
                    {t('reviews.sendReply')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-300">
            {t('reviews.noReviews')}
          </div>
        )}
      </div>
    </div>
  </SubscriptionGuard>
);
}