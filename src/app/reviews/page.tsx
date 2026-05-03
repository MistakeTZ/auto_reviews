"use client";

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('reviews.title')}</h1>
        <div className="flex space-x-2 bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
          {(['all', 'pending', 'auto-answered'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {getFilterText(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map(review => (
          <Card key={review.id} className={review.status === 'pending' ? 'border-orange-200 dark:border-orange-900/50' : ''}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{review.productName}</h3>
                  <div className="flex items-center mt-1 space-x-3 text-sm">
                    <span className="flex text-yellow-500">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="text-gray-500">{review.date}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    review.status === 'auto-answered' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {review.status === 'auto-answered' ? t('common.answered') : t('common.pending')}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                "{review.text}"
              </p>

              {review.status === 'auto-answered' ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">{t('reviews.automatedResponse')}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{review.autoAnswerText}</p>
                </div>
              ) : (
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={replyText[review.id] || ''}
                    onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                    placeholder={t('reviews.typeReply')}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
          <div className="text-center py-12 text-gray-500">
            {t('reviews.noReviews')}
          </div>
        )}
      </div>
    </div>
  );
}
