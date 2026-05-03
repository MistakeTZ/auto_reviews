"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { MessageCircle, Star, Zap, ShieldCheck, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function LandingPage() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">AutoReviews</h1>
        <div className="space-x-4 flex items-center">
          <button onClick={toggleLanguage} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2">
            <Globe size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 font-medium">{t('common.login')}</Link>
          <Link href="/register">
            <Button>{t('common.signUp')}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 max-w-3xl">
          {t('landing.title').split('Wildberries')[0]}<span className="text-purple-600">Wildberries</span>{t('landing.title').split('Wildberries')[1]}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
          {t('landing.subtitle')}
        </p>

        <div className="flex space-x-4 mb-20">
          <Link href="/register">
            <Button className="px-8 py-4 text-lg">{t('landing.getStarted')}</Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" className="px-8 py-4 text-lg">{t('landing.viewDemo')}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 text-purple-600"><Zap size={32} /></div>
              <h3 className="text-xl font-bold mb-2">{t('landing.feature1Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('landing.feature1Desc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 text-purple-600"><Star size={32} /></div>
              <h3 className="text-xl font-bold mb-2">{t('landing.feature2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('landing.feature2Desc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 text-purple-600"><ShieldCheck size={32} /></div>
              <h3 className="text-xl font-bold mb-2">{t('landing.feature3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('landing.feature3Desc')}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
