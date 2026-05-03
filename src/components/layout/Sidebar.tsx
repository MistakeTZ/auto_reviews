"use client";

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { LayoutDashboard, MessageSquare, ShieldAlert, Settings, LogOut, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect } from 'react';

export default function Sidebar() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const jwtToken = useAppStore(state => state.jwtToken);
  const logout = useAppStore(state => state.logout);
  const fetchMe = useAppStore(state => state.fetchMe);
  const fetchProducts = useAppStore(state => state.fetchProducts);
  const fetchRules = useAppStore(state => state.fetchRules);
  const fetchReviews = useAppStore(state => state.fetchReviews);

  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated && jwtToken) {
      fetchMe();
      fetchProducts();
      fetchRules();
      fetchReviews();
    }
  }, [isAuthenticated, jwtToken, fetchMe, fetchProducts, fetchRules, fetchReviews]);

  if (!isAuthenticated && pathname !== '/demo') return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">ReviewAI</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Wildberries</p>
        </div>
        <button onClick={toggleLanguage} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Toggle Language">
          <Globe size={18} className="text-gray-500" />
          <span className="sr-only">{language.toUpperCase()}</span>
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
          <LayoutDashboard size={20} />
          <span>{t('common.dashboard')}</span>
        </Link>
        <Link href="/reviews" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
          <MessageSquare size={20} />
          <span>{t('common.reviewsInbox')}</span>
        </Link>
        <Link href="/rules" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
          <ShieldAlert size={20} />
          <span>{t('common.autoAnswerRules')}</span>
        </Link>
        <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
          <Settings size={20} />
          <span>{t('common.settings')}</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('common.sellerAccount')}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition-colors w-full px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={16} />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
