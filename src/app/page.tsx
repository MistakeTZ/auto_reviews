"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  MessageCircle, Star, Zap, ShieldCheck, Globe,
  ArrowRight, Settings, Quote, Check, HelpCircle
} from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-purple-300 dark:selection:bg-purple-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <MessageCircle size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              ReviewAI
            </h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button onClick={toggleLanguage} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" title="Toggle Language">
              <Globe size={20} className="text-slate-500 group-hover:text-purple-600 transition-colors" />
            </button>
            <Link href="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hidden sm:block">
              {t('common.login')}
            </Link>
            <Link href="/register">
              <Button className="rounded-full font-semibold shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all px-6">
                {t('common.signUp')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-purple-500/20 dark:bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-purple-600 dark:text-purple-400 text-sm font-bold mb-8 hover:scale-105 transition-transform cursor-default">
              <Star size={14} className="fill-purple-600 dark:fill-purple-400" />
              <span>{t('landing.trustedBanner')}</span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 max-w-5xl tracking-tighter leading-[1.05]">
              {t('landing.title').split('Wildberries')[0]}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 relative inline-block">
                Wildberries
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-purple-400/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" />
                </svg>
              </span>
              {t('landing.title').split('Wildberries')[1]}
            </h2>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
              {t('landing.subtitle')}
            </p>

            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-10 py-7 text-lg rounded-2xl shadow-xl shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 font-bold">
                {t('landing.getStarted')}
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-200/50 dark:border-slate-800/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: t('landing.feature1Title'), desc: t('landing.feature1Desc'), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                { icon: Settings, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
                { icon: ShieldCheck, title: t('landing.feature3Title'), desc: t('landing.feature3Desc'), color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t('landing.howItWorks')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-1 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200 dark:from-purple-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 rounded-full" />

              {[
                { step: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc'), color: 'border-purple-200 dark:border-purple-900', text: 'text-purple-600 dark:text-purple-400' },
                { step: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc'), color: 'border-indigo-200 dark:border-indigo-900', text: 'text-indigo-600 dark:text-indigo-400' },
                { step: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc'), color: 'border-pink-200 dark:border-pink-900', text: 'text-pink-600 dark:text-pink-400' }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center group">
                  <div className={`w-20 h-20 rounded-full bg-white dark:bg-slate-950 border-8 ${item.color} flex items-center justify-center text-2xl font-black ${item.text} z-10 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mt-8 mb-3 text-slate-900 dark:text-white text-center">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-[280px] text-center font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 dark:text-white mb-16 tracking-tight">
              {t('landing.testimonialsTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { text: t('landing.testimonial1Text'), author: t('landing.testimonial1Author'), role: t('landing.testimonial1Role') },
                { text: t('landing.testimonial2Text'), author: t('landing.testimonial2Author'), role: t('landing.testimonial2Role') },
                { text: t('landing.testimonial3Text'), author: t('landing.testimonial3Author'), role: t('landing.testimonial3Role') }
              ].map((testimonial, idx) => (
                <Card key={idx} className="bg-white dark:bg-slate-950 border-none shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform">
                  <CardContent className="p-8">
                    <Quote className="w-10 h-10 text-purple-300 dark:text-purple-800 mb-6" />
                    <p className="text-slate-700 dark:text-slate-300 mb-8 font-medium italic">
                      {testimonial.text}
                    </p>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{testimonial.author}</p>
                      <p className="text-sm text-slate-500 font-medium">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-to-br from-purple-700 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-white divide-y md:divide-y-0 md:divide-x divide-purple-500/50">
              <div className="py-4">
                <p className="text-6xl font-black mb-3 drop-shadow-md">{t('landing.stat1')}</p>
                <p className="text-purple-200 font-bold text-lg uppercase tracking-wider">{t('landing.stat1Desc')}</p>
              </div>
              <div className="py-4">
                <p className="text-6xl font-black mb-3 drop-shadow-md flex items-center justify-center gap-3">
                  {t('landing.stat2')} <Star className="fill-yellow-400 text-yellow-400 w-10 h-10" />
                </p>
                <p className="text-purple-200 font-bold text-lg uppercase tracking-wider">{t('landing.stat2Desc')}</p>
              </div>
              <div className="py-4">
                <p className="text-6xl font-black mb-3 drop-shadow-md">{t('landing.stat3')}</p>
                <p className="text-purple-200 font-bold text-lg uppercase tracking-wider">{t('landing.stat3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 dark:text-white mb-16 tracking-tight">
              {t('landing.pricingTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {[
                { title: t('landing.pricingStarter'), price: t('landing.pricingStarterPrice'), desc: t('landing.pricingStarterDesc'), isPopular: false },
                { title: t('landing.pricingPro'), price: t('landing.pricingProPrice'), desc: t('landing.pricingProDesc'), isPopular: true },
                { title: t('landing.pricingEnterprise'), price: t('landing.pricingEnterprisePrice'), desc: t('landing.pricingEnterpriseDesc'), isPopular: false }
              ].map((plan, idx) => (
                <div key={idx} className={`relative p-8 rounded-3xl ${plan.isPopular ? 'bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-2xl shadow-purple-600/30 md:-translate-y-4' : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800'}`}>
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.title}</h3>
                  <p className={`mb-6 font-medium ${plan.isPopular ? 'text-purple-200' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className={`font-bold ${plan.isPopular ? 'text-purple-200' : 'text-slate-500'}`}>{t('landing.pricingMonth')}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {[1, 2, 3].map((_, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check size={18} className={plan.isPopular ? 'text-pink-300' : 'text-purple-500'} />
                        <span className={`font-medium ${plan.isPopular ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>Feature point included</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block w-full">
                    <Button variant={plan.isPopular ? 'secondary' : 'primary'} className={`w-full py-6 text-base rounded-xl font-bold ${plan.isPopular ? 'bg-white text-purple-700 hover:bg-slate-50' : ''}`}>
                      {t('landing.pricingBtn')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 dark:text-white mb-16 tracking-tight">
              {t('landing.faqTitle')}
            </h2>
            <div className="space-y-6">
              {[
                { q: t('landing.faq1Q'), a: t('landing.faq1A') },
                { q: t('landing.faq2Q'), a: t('landing.faq2A') },
                { q: t('landing.faq3Q'), a: t('landing.faq3A') }
              ].map((faq, idx) => (
                <Card key={idx} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-6 md:p-8 flex gap-4 md:gap-6">
                    <HelpCircle className="w-6 h-6 text-purple-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3">{faq.q}</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
              <MessageCircle size={16} className="text-white dark:text-slate-900" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">ReviewAI</span>
          </div>
          <p className="text-sm font-medium text-slate-500">{t('landing.footerRights')}</p>
        </div>
      </footer>
    </div>
  );
}