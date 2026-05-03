"use client";

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Dashboard() {
  const reviews = useAppStore(state => state.reviews);
  const rules = useAppStore(state => state.rules);
  const { t } = useTranslation();

  const totalReviews = reviews.length;
  const autoAnswered = reviews.filter(r => r.status === 'auto-answered').length;
  const pending = reviews.filter(r => r.status === 'pending').length;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">{t('dashboard.overview')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 mr-4">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.totalReviews')}</p>
              <p className="text-2xl font-bold">{totalReviews}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.autoAnswered')}</p>
              <p className="text-2xl font-bold">{autoAnswered}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-600 dark:text-orange-300 mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.pendingReply')}</p>
              <p className="text-2xl font-bold">{pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300 mr-4">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.avgRating')}</p>
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.slice(0, 5).map(review => (
                <div key={review.id} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${review.status === 'auto-answered' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="font-medium">{review.productName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{review.text}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md mr-2">⭐ {review.rating}</span>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.activeRules')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-purple-600 dark:text-purple-400">{rule.name}</h4>
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">{t('common.active')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('dashboard.ifRatingIs')} <span className="font-semibold">{rule.conditionRatingOperator === 'less_than' ? t('dashboard.lessThan') : rule.conditionRatingOperator === 'more_than' ? t('dashboard.moreThan') : t('dashboard.exactly')} {rule.conditionRating} {t('dashboard.stars')}</span>
                    {rule.conditionKeyword && <span> {t('dashboard.andContains')} "{rule.conditionKeyword}"</span>}
                  </p>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-sm text-gray-500">{t('dashboard.noActiveRules')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
