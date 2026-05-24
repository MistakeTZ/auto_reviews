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
    <div className="pt-24 px-4 pb-8 md:p-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-8">{t('dashboard.overview')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 mr-4">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">{t('dashboard.totalReviews')}</p>
              <p className="text-2xl font-black text-slate-900">{totalReviews}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">{t('dashboard.autoAnswered')}</p>
              <p className="text-2xl font-black text-slate-900">{autoAnswered}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">{t('dashboard.pendingReply')}</p>
              <p className="text-2xl font-black text-slate-900">{pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mr-4">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">{t('dashboard.avgRating')}</p>
              <p className="text-2xl font-black text-slate-900">{averageRating.toFixed(1)}</p>
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
                <div key={review.id} className="flex items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className={`w-2.5 h-2.5 mt-2 rounded-full mr-4 ${review.status === 'auto-answered' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-amber-500 shadow-amber-200'} shadow-sm`} />
                  <div>
                    <p className="font-bold text-slate-800">{review.productName}</p>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{review.text}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md mr-2">⭐ {review.rating}</span>
                      <span className="text-xs font-medium text-slate-400">{review.date}</span>
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
                <div key={rule.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2" style={{ gap: '5%' }}>
                    <h4 className="font-bold text-indigo-700">{rule.name}</h4>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold">{t('common.active')}</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    {t('dashboard.ifRatingIs')} <span className="font-bold text-slate-800">{rule.conditionRatingOperator === 'less_than' ? t('dashboard.lessThan') : rule.conditionRatingOperator === 'more_than' ? t('dashboard.moreThan') : t('dashboard.exactly')} {rule.conditionRating} {t('dashboard.stars')}</span>
                    {rule.conditionKeyword && <span> {t('dashboard.andContains')} "{rule.conditionKeyword}"</span>}
                  </p>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-sm font-medium text-slate-500 text-center py-6">{t('dashboard.noActiveRules')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}