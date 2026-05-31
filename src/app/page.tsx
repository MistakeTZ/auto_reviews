"use client";

import Link from 'next/link';
import {
  MessageCircle, Zap, ShieldCheck,
  ArrowRight, Settings, Check
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import FlagSwitcher from '@/components/ui/FlagSwitcher';
import ScenariosSection from '@/components/landing/ScenariosSection';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, type CSSProperties } from 'react';
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

  const [totalAnswers, setTotalAnswers] = useState<number | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const revealDelay = (ms: number): CSSProperties => ({ '--reveal-delay': `${ms}ms` } as CSSProperties);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)'));

    if (revealElements.length === 0) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!referralCodeFromUrl) {
      return;
    }
    localStorage.setItem('pendingReferralCode', referralCodeFromUrl);
  }, [referralCodeFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLandingReviews = async () => {
      try {
        const response = await fetch('/api/landing/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data: { total_answers?: unknown } = await response.json();
        if (typeof data.total_answers === 'number' && Number.isFinite(data.total_answers)) {
          setTotalAnswers(Math.max(0, Math.trunc(data.total_answers)));
        }
      } catch {
        // Keep localized fallback metric if the request fails.
      }
    };

    const onWindowLoad = () => {
      void fetchLandingReviews();
    };

    if (document.readyState === 'complete') {
      onWindowLoad();
    } else {
      window.addEventListener('load', onWindowLoad, { once: true });
    }

    return () => {
      controller.abort();
      window.removeEventListener('load', onWindowLoad);
    };
  }, []);

  const stat1Value = totalAnswers === null
    ? t('landing.stat1')
    : new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US').format(totalAnswers);

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
            <div className="hero-content">
              <span className="eyebrow" data-reveal="up" style={revealDelay(120)}>{t('landing.trustedBanner')}</span>
              <h2 className="hero-headline" data-reveal="up" style={revealDelay(180)}>
                {t('landing.titlePrefix')}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative inline-block">
                  {t('landing.titleHighlight')}
                </span>
                {t('landing.titleSuffix')}
              </h2>

              <p className="hero-subheadline" data-reveal="up" style={revealDelay(260)}>
                {t('landing.subtitle')}
              </p>

              <div className="hero-buttons" data-reveal="up" style={revealDelay(340)}>
                <Link href={isAuthenticated ? "/dashboard" : registerHref} className="btn-primary">
                  {isAuthenticated ? t('common.dashboard') : t('landing.getStarted')}
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link href="https://youtu.be/z8gAzje9ho4" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  {t('landing.viewDemo')}
                </Link>
              </div>
            </div>

            <div className="hero-visual" data-reveal="right" style={revealDelay(220)}>
              <div className="image-container">
                <picture>
                  <source media="(max-width: 769px)" srcSet="/dashboard_sm.webp" />
                  <source media="(min-width: 770px)" srcSet="/dashboard_md.webp" />
                  <img src="/dashboard_md.webp" alt={t('landing.heroImageAlt')} fetchPriority="high" decoding="async" />
                </picture>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Metrics Bar */}
        <section className="trust-bar-section">
          <div className="trust-bar-container">
            <div className="trust-metric" data-reveal="up" style={revealDelay(90)}>
              <strong>{stat1Value}</strong>
              <span>{t('landing.stat1Desc')}</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-metric" data-reveal="up" style={revealDelay(170)}>
              <strong>{t('landing.stat2')}</strong>
              <span>{t('landing.stat2Desc')}</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-metric" data-reveal="up" style={revealDelay(250)}>
              <strong>{t('landing.stat3')}</strong>
              <span>{t('landing.stat3Desc')}</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="services-section">
          <div className="services-header" data-reveal="up">
            <span className="services-eyebrow">{t('landing.capabilities')}</span>
            <h2 className="services-title">{t('landing.feature1Title') ? t('landing.ourPowerfulFeatures') : t('landing.features')}</h2>
          </div>
          <div className="services-grid">
            {[
              { icon: Zap, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
              { icon: Settings, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
              { icon: ShieldCheck, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') }
            ].map((feature, idx) => (
              <div key={idx} className="service-card" data-reveal="zoom" style={revealDelay(120 + (idx * 90))}>
                <div className="service-card-icon">
                  <feature.icon size={28} />
                </div>
                <h3 className="service-card-title">{feature.title}</h3>
                <p className="service-card-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <ScenariosSection
          t={t}
          language={language}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />

        {/* How it Works Section */}
        <section className="why-choose-section">
          <div className="why-choose-container">
            <span className="why-choose-eyebrow" data-reveal="up">{t('landing.process')}</span>
            <h2 className="why-choose-title" data-reveal="up" style={revealDelay(100)}>{t('landing.howItWorks')}</h2>
            <div className="why-choose-grid">
              {[
                { step: '01', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
                { step: '02', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
                { step: '03', title: t('landing.step3Title'), desc: t('landing.step3Desc') }
              ].map((item, idx) => (
                <div key={idx} className="why-choose-card" data-reveal="up" style={revealDelay(110 + (idx * 90))}>
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
            <span className="about-us-eyebrow" data-reveal="up">{t('landing.reviews')}</span>
            <h2 className="about-us-headline" data-reveal="up" style={revealDelay(90)}>{t('landing.testimonialsTitle')}</h2>
          </div>
          <div className="about-us-pillars">
            {[
              { text: t('landing.testimonial1Text'), author: t('landing.testimonial1Author'), role: t('landing.testimonial1Role') },
              { text: t('landing.testimonial2Text'), author: t('landing.testimonial2Author'), role: t('landing.testimonial2Role') },
              { text: t('landing.testimonial3Text'), author: t('landing.testimonial3Author'), role: t('landing.testimonial3Role') }
            ].map((testimonial, idx) => (
              <div key={idx} className="about-us-card" data-reveal="up" style={revealDelay(110 + (idx * 85))}>
                <p>{testimonial.text}</p>
                <div className="about-us-card-author">
                  <div className="about-us-card-avatar">
                    {testimonial.author[0]}
                  </div>
                  <div className="about-us-card-info">
                    <h3>{testimonial.author}</h3>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section">
          <div className="pricing-header">
            <span className="why-choose-eyebrow" data-reveal="up">{t('landing.pricing')}</span>
            <h2 className="why-choose-title" data-reveal="up" style={revealDelay(100)}>{t('landing.pricingTitle')}</h2>
          </div>
          <div className="pricing-grid">
            {[
              { title: t('landing.pricingStarter'), price: t('landing.pricingStarterPrice'), desc: t('landing.pricingStarterDesc'), isPopular: false, period: t('landing.pricingHalfMonth') },
              { title: t('landing.pricingPro'), price: t('landing.pricingProPrice'), desc: t('landing.pricingProDesc'), isPopular: true, period: t('landing.pricingMonth') },
              { title: t('landing.pricingEnterprise'), price: t('landing.pricingEnterprisePrice'), desc: t('landing.pricingEnterpriseDesc'), isPopular: false, period: t('landing.pricingWeek') }
            ].map((plan, idx) => (
              <div key={idx} className={`pricing-card ${plan.isPopular ? 'is-popular' : ''}`} data-reveal={plan.isPopular ? 'zoom' : 'up'} style={revealDelay(120 + (idx * 95))}>
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
