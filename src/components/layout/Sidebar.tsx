"use client";

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { LayoutDashboard, MessageSquare, ShieldAlert, Settings, LogOut, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect } from 'react';

export default function Sidebar() {
  const { isAuthenticated, jwtToken, logout, fetchMe, fetchProducts, fetchRules, fetchReviews } = useAppStore();
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

  const linkClass = (path: string) => `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${pathname === path
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0 shadow-sm z-10">
      <div className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-indigo-600 tracking-tight">reAnswer</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Wildberries</p>
        </div>
        <button onClick={toggleLanguage} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors" title="Toggle Language">
          <Globe size={18} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <Link href="/dashboard" className={linkClass('/dashboard')}><LayoutDashboard size={18} /><span>{t('common.dashboard')}</span></Link>
        <Link href="/reviews" className={linkClass('/reviews')}><MessageSquare size={18} /><span>{t('common.reviewsInbox')}</span></Link>
        <Link href="/rules" className={linkClass('/rules')}><ShieldAlert size={18} /><span>{t('common.autoAnswerRules')}</span></Link>
        <Link href="/settings" className={linkClass('/settings')}><Settings size={18} /><span>{t('common.settings')}</span></Link>
      </nav>

      <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
            S
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{t('common.sellerAccount')}</p>
            <p className="text-xs text-slate-500 truncate">Active Plan</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center justify-center space-x-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100">
          <LogOut size={16} />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
}