"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  MessageCircle, Star, Zap, ShieldCheck, Globe,
  ArrowRight, Settings, Quote, Check, HelpCircle
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function LandingPage() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-200">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MessageCircle size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              reAnswer
            </h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button onClick={toggleLanguage} className="p-2.5 rounded-full hover:bg-slate-100 transition-colors group" title="Toggle Language">
              <Globe size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
            </button>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="rounded-xl font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all px-6">
                  {t('common.dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="sm:hidden">
                  <Button className="rounded-xl font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all px-6">
                    {t('common.login')}
                  </Button>
                </Link>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
                  {t('common.login')}
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button className="rounded-xl font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all px-6">
                    {t('common.signUp')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 text-sm font-bold mb-8 hover:scale-105 transition-transform cursor-default">
              <Star size={14} className="fill-indigo-600" />
              <span>{t('landing.trustedBanner')}</span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 max-w-5xl tracking-tighter leading-[1.05]">
              {t('landing.title').split('Wildberries')[0]}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative inline-block">
                Wildberries
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-400/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" />
                </svg>
              </span>
              {t('landing.title').split('Wildberries')[1]}
            </h2>

            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed font-medium">
              {t('landing.subtitle')}
            </p>

            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-10 py-7 text-lg rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 font-bold">
                {t('landing.getStarted')}
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white/60 backdrop-blur-sm border-y border-slate-200/60 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: t('landing.feature1Title'), desc: t('landing.feature1Desc'), color: 'text-indigo-600', bg: 'bg-indigo-100' },
                { icon: Settings, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: 'text-purple-600', bg: 'bg-purple-100' },
                { icon: ShieldCheck, title: t('landing.feature3Title'), desc: t('landing.feature3Desc'), color: 'text-blue-600', bg: 'bg-blue-100' }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{t('landing.howItWorks')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-1 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 rounded-full" />

              {[
                { step: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc'), color: 'border-indigo-100', text: 'text-indigo-600' },
                { step: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc'), color: 'border-purple-100', text: 'text-purple-600' },
                { step: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc'), color: 'border-blue-100', text: 'text-blue-600' }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center group">
                  <div className={`w-20 h-20 rounded-full bg-white border-8 ${item.color} flex items-center justify-center text-2xl font-black ${item.text} z-10 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mt-8 mb-3 text-slate-900 text-center">{item.title}</h3>
                  <p className="text-slate-600 max-w-[280px] text-center font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 mb-16 tracking-tight">
              {t('landing.testimonialsTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { text: t('landing.testimonial1Text'), author: t('landing.testimonial1Author'), role: t('landing.testimonial1Role') },
                { text: t('landing.testimonial2Text'), author: t('landing.testimonial2Author'), role: t('landing.testimonial2Role') },
                { text: t('landing.testimonial3Text'), author: t('landing.testimonial3Author'), role: t('landing.testimonial3Role') }
              ].map((testimonial, idx) => (
                <Card key={idx} className="border-none shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform">
                  <CardContent className="p-8">
                    <Quote className="w-10 h-10 text-indigo-200 mb-6" />
                    <p className="text-slate-700 mb-8 font-medium italic">
                      {testimonial.text}
                    </p>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.author}</p>
                      <p className="text-sm text-slate-500 font-medium">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 mb-16 tracking-tight">
              {t('landing.pricingTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {[
                { title: t('landing.pricingStarter'), price: t('landing.pricingStarterPrice'), desc: t('landing.pricingStarterDesc'), isPopular: false, period: t('landing.pricingHalfMonth') },
                { title: t('landing.pricingPro'), price: t('landing.pricingProPrice'), desc: t('landing.pricingProDesc'), isPopular: true, period: t('landing.pricingMonth') },
                { title: t('landing.pricingEnterprise'), price: t('landing.pricingEnterprisePrice'), desc: t('landing.pricingEnterpriseDesc'), isPopular: false, period: t('landing.pricingWeek') }
              ].map((plan, idx) => (
                <div key={idx} className={`relative p-8 rounded-3xl flex flex-col h-full ${plan.isPopular ? 'bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-600/30' : 'bg-white border border-slate-200'}`}>
                  {plan.isPopular && false && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-slate-900'}`}>{plan.title}</h3>
                  <p className={`mb-6 font-medium ${plan.isPopular ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className={`font-bold ${plan.isPopular ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {[1, 2, 3].map((_, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check size={18} className={plan.isPopular ? 'text-pink-300' : 'text-indigo-500'} />
                        <span className={`font-medium ${plan.isPopular ? 'text-white' : 'text-slate-600'}`}>Feature point included</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block w-full">
                    <Button variant={plan.isPopular ? 'secondary' : 'primary'} className={`w-full py-6 text-base rounded-xl font-bold ${plan.isPopular ? 'bg-white text-indigo-700 hover:bg-slate-50' : ''}`}>
                      {t('landing.pricingBtn')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">reAnswer</span>
          </div>
          <p className="text-sm font-medium text-slate-500">{t('landing.footerRights')}</p>
        </div>
      </footer>
    </div>
  );
}