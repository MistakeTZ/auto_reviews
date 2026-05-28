"use client";

import Link from 'next/link';
import {
  MessageCircle, Zap, ShieldCheck,
  ArrowRight, Settings, Check
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import FlagSwitcher from '@/components/ui/FlagSwitcher';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import './landing.css';

function LandingPageContent() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const { t, language, setLanguage } = useTranslation();
  const searchParams = useSearchParams();
  const referralCodeFromUrl = searchParams.get('ref')?.trim() || '';
  const registerHref = referralCodeFromUrl
    ? `/register?ref=${encodeURIComponent(referralCodeFromUrl)}`
    : '/register';
  const pricingFeatureGroups = t('landing.pricingFeatureIncluded')
    .split('\n\n')
    .map((group) => group.split('\n').map((line) => line.trim()).filter(Boolean));

  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.05 }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    if (!referralCodeFromUrl) {
      return;
    }
    localStorage.setItem('pendingReferralCode', referralCodeFromUrl);
  }, [referralCodeFromUrl]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className={`landing-page landing-shell ${isVisible ? 'is-visible' : ''}`}>
      {/* Header */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MessageCircle size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              {t('landing.brandName')}
            </h1>
          </div>
          
          <div className="header-cta">
            <button onClick={toggleLanguage} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center" title={t('landing.toggleLanguage')}>
              <FlagSwitcher />
            </button>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-get-consultation flex items-center justify-center">
                {t('common.dashboard')}
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
                  {t('common.login')}
                </Link>
                <Link href={registerHref} className="btn-get-consultation flex items-center justify-center">
                  {t('common.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content" data-reveal="left">
              <span className="eyebrow">{t('landing.trustedBanner')}</span>
              <h2 className="hero-headline">
                {t('landing.titlePrefix')}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative inline-block">
                  {t('landing.titleHighlight')}
                </span>
                {t('landing.titleSuffix')}
              </h2>

              <p className="hero-subheadline">
                {t('landing.subtitle')}
              </p>

              <div className="hero-buttons">
                <Link href={isAuthenticated ? "/dashboard" : registerHref} className="btn-primary">
                  {isAuthenticated ? t('common.dashboard') : t('landing.getStarted')}
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                {/* <Link href="/demo" className="btn-secondary">
                  {t('landing.viewDemo')}
                </Link> */}
              </div>
            </div>

            <div className="hero-visual" data-reveal="right">
              <div className="image-container">
                <img src="/dashboard.jpg" alt={t('landing.heroImageAlt')} />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Metrics Bar */}
        <section className="trust-bar-section" data-reveal="zoom">
          <div className="trust-bar-container">
            <div className="trust-metric">
              <strong>{t('landing.stat1')}</strong>
              <span>{t('landing.stat1Desc')}</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-metric">
              <strong>{t('landing.stat2')}</strong>
              <span>{t('landing.stat2Desc')}</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-metric">
              <strong>{t('landing.stat3')}</strong>
              <span>{t('landing.stat3Desc')}</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="services-section">
          <div className="services-header" data-reveal="zoom">
            <span className="services-eyebrow">{t('landing.capabilities')}</span>
            <h2 className="services-title">{t('landing.feature1Title') ? t('landing.ourPowerfulFeatures') : t('landing.features')}</h2>
          </div>
          <div className="services-grid">
            {[
              { icon: Zap, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
              { icon: Settings, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
              { icon: ShieldCheck, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') }
            ].map((feature, idx) => (
              <div key={idx} className="service-card" data-reveal="left" style={{ ['--reveal-delay' as any]: `${idx * 150}ms` }}>
                <div className="service-card-icon">
                  <feature.icon size={28} />
                </div>
                <h3 className="service-card-title">{feature.title}</h3>
                <p className="service-card-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works Section */}
        <section className="why-choose-section">
          <div className="why-choose-container">
            <span className="why-choose-eyebrow" data-reveal="zoom">{t('landing.process')}</span>
            <h2 className="why-choose-title" data-reveal="zoom">{t('landing.howItWorks')}</h2>
            <div className="why-choose-grid">
              {[
                { step: '01', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
                { step: '02', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
                { step: '03', title: t('landing.step3Title'), desc: t('landing.step3Desc') }
              ].map((item, idx) => (
                <div key={idx} className="why-choose-card" data-reveal="left" style={{ ['--reveal-delay' as any]: `${idx * 150}ms` }}>
                  <div className="why-choose-card-header">
                    <div className="why-choose-icon">{item.step}</div>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="about-us-section">
          <div className="about-us-intro">
            <span className="about-us-eyebrow" data-reveal="zoom">{t('landing.reviews')}</span>
            <h2 className="about-us-headline" data-reveal="zoom">{t('landing.testimonialsTitle')}</h2>
          </div>
          <div className="about-us-pillars">
            {[
              { text: t('landing.testimonial1Text'), author: t('landing.testimonial1Author'), role: t('landing.testimonial1Role') },
              { text: t('landing.testimonial2Text'), author: t('landing.testimonial2Author'), role: t('landing.testimonial2Role') },
              { text: t('landing.testimonial3Text'), author: t('landing.testimonial3Author'), role: t('landing.testimonial3Role') }
            ].map((testimonial, idx) => (
              <div key={idx} className="about-us-card" data-reveal="left" style={{ ['--reveal-delay' as any]: `${idx * 150}ms` }}>
                <p>{testimonial.text}</p>
                <div className="about-us-card-author">
                  <div className="about-us-card-avatar">
                    {testimonial.author[0]}
                  </div>
                  <div className="about-us-card-info">
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section">
          <div className="pricing-header" data-reveal="zoom">
            <span className="why-choose-eyebrow">{t('landing.pricing')}</span>
            <h2 className="why-choose-title">{t('landing.pricingTitle')}</h2>
          </div>
          <div className="pricing-grid">
            {[
              { title: t('landing.pricingStarter'), price: t('landing.pricingStarterPrice'), desc: t('landing.pricingStarterDesc'), isPopular: false, period: t('landing.pricingHalfMonth') },
              { title: t('landing.pricingPro'), price: t('landing.pricingProPrice'), desc: t('landing.pricingProDesc'), isPopular: true, period: t('landing.pricingMonth') },
              { title: t('landing.pricingEnterprise'), price: t('landing.pricingEnterprisePrice'), desc: t('landing.pricingEnterpriseDesc'), isPopular: false, period: t('landing.pricingWeek') }
            ].map((plan, idx) => (
              <div key={idx} className={`pricing-card ${plan.isPopular ? 'is-popular' : ''}`} data-reveal="left" style={{ ['--reveal-delay' as any]: `${idx * 150}ms` }}>
                <h3>{plan.title}</h3>
                <p className="pricing-card-desc">{plan.desc}</p>
                <div className="pricing-price-wrap">
                  <span className="pricing-price">{plan.price}</span>
                  <span className="pricing-period">{plan.period}</span>
                </div>
                <ul className="pricing-features">
                  {(pricingFeatureGroups[idx] || []).map((feature, i) => (
                    <li key={i}>
                      <i><Check size={16} /></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={isAuthenticated ? "/dashboard" : registerHref} className={plan.isPopular ? "btn-primary is-filled" : "btn-secondary"}>
                  {isAuthenticated ? t('common.dashboard') : t('landing.pricingBtn')}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer-container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <MessageCircle size={16} className="text-slate-900" />
            </div>
            <span className="font-bold text-white tracking-tight">{t('landing.brandName')}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('common.privacyPolicy')}
            </Link>
            <Link href="/consent" className="hover:text-white transition-colors">
              {t('common.personalDataConsent')}
            </Link>
            <Link href="/legal" className="hover:text-white transition-colors">
              {t('common.legalInfo')}
            </Link>
          </div>

          <p className="site-footer-copy text-sm text-slate-500">{t('landing.footerRights')}</p>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingPageContent />
    </Suspense>
  );
}
