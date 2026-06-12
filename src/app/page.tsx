"use client";

import Link from "next/link";
import {
  MessageCircle,
  Zap,
  ShieldCheck,
  ArrowRight,
  Settings,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import FlagSwitcher from "@/components/ui/FlagSwitcher";
import ScenariosSection from "@/components/landing/ScenariosSection";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, type CSSProperties } from "react";
import "./landing.css";

function LandingPageContent() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { t, language, setLanguage } = useTranslation();
  const searchParams = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref")?.trim() || "";
  const registerHref = referralCodeFromUrl
    ? `/register?ref=${encodeURIComponent(referralCodeFromUrl)}`
    : "/register";
  const pricingFeatureGroups = t("landing.pricingFeatureIncluded")
    .split("\n\n")
    .map((group) =>
      group
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    );

  const [totalAnswers, setTotalAnswers] = useState<number | null>(null);
  const [expandedTestimonials, setExpandedTestimonials] = useState<number[]>(
    [],
  );

  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const revealDelay = (ms: number): CSSProperties =>
    ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"),
    );

    if (revealElements.length === 0) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 0px 0px",
      },
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
    localStorage.setItem("pendingReferralCode", referralCodeFromUrl);
  }, [referralCodeFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLandingReviews = async () => {
      try {
        const response = await fetch("/api/landing/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data: { total_answers?: unknown } = await response.json();
        if (
          typeof data.total_answers === "number" &&
          Number.isFinite(data.total_answers)
        ) {
          setTotalAnswers(Math.max(0, Math.trunc(data.total_answers)));
        }
      } catch {
        // Keep localized fallback metric if the request fails.
      }
    };

    const onWindowLoad = () => {
      void fetchLandingReviews();
    };

    if (document.readyState === "complete") {
      onWindowLoad();
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    return () => {
      controller.abort();
      window.removeEventListener("load", onWindowLoad);
    };
  }, []);

  const stat1Value =
    totalAnswers === null
      ? t("landing.stat1")
      : new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US").format(
          totalAnswers,
        );

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  const toggleTestimonial = (index: number) => {
    setExpandedTestimonials((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  return (
    <div
      className={`landing-page landing-shell ${isVisible ? "is-visible" : ""} w-full bg-white font-[var(--font-main)] text-[#0A192F]`}
    >
      <header
        className={`site-header ${scrolled ? "scrolled" : ""} sticky top-0 z-[1000] w-full bg-white/95 backdrop-blur-xl`}
      >
        <div className="header-container mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-4 py-5 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
              <MessageCircle size={20} className="text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-black tracking-tight text-transparent">
              {t("landing.brandName")}
            </h1>
          </div>

          <div className="header-cta flex items-center justify-end gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center rounded-xl p-1.5 transition-colors hover:bg-slate-100"
              title={t("landing.toggleLanguage")}
            >
              <FlagSwitcher />
            </button>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-get-consultation inline-flex items-center justify-center rounded-xl border-2 border-[#0A192F] bg-[#0A192F] px-6 py-3 text-[0.95rem] font-semibold text-white shadow-[0_10px_20px_rgba(10,25,47,0.12)] transition duration-200 hover:border-[#1f366c] hover:bg-[#1f366c] hover:shadow-[0_14px_26px_rgba(10,25,47,0.18)]"
              >
                {t("common.dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 sm:block"
                >
                  {t("common.login")}
                </Link>
                <Link
                  href={registerHref}
                  className="btn-get-consultation inline-flex items-center justify-center rounded-xl border-2 border-[#0A192F] bg-[#0A192F] px-4 sm:px-6 py-3 text-[0.95rem] font-semibold text-white shadow-[0_10px_20px_rgba(10,25,47,0.12)] transition duration-200 hover:border-[#1f366c] hover:bg-[#1f366c] hover:shadow-[0_14px_26px_rgba(10,25,47,0.18)]"
                >
                  {t("common.signUp")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <section className="hero-section overflow-hidden bg-[#F7FAFC] px-4 py-12 lg:px-8">
          <div className="hero-container mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:gap-16">
            <div className="hero-content flex flex-1 flex-col items-center lg:items-start">
              <span
                className="eyebrow mb-4 text-[0.85rem] font-bold uppercase tracking-[2px] text-[#1f366c]"
                data-reveal="up"
                style={revealDelay(120)}
              >
                {t("landing.trustedBanner")}
              </span>
              <h2
                className="hero-headline mb-6 max-w-[22ch] text-[clamp(2rem,4.7vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-1px] text-[#0A192F]"
                data-reveal="up"
                style={revealDelay(180)}
              >
                {t("landing.titlePrefix")}
                <span className="relative inline-block bg-gradient-to-r from-indigo-600 to-purple-600 bg-[length:220%_220%] bg-clip-text text-transparent">
                  {t("landing.titleHighlight")}
                </span>
                {t("landing.titleSuffix")}
              </h2>

              <p
                className="hero-subheadline mb-10 max-w-[90%] text-[clamp(1rem,1.8vw,1.125rem)] leading-[1.6] text-[#4A5568] lg:max-w-none"
                data-reveal="up"
                style={revealDelay(260)}
              >
                {t("landing.subtitle")}
              </p>

              <div
                className="hero-buttons flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
                data-reveal="up"
                style={revealDelay(340)}
              >
                <Link
                  href={isAuthenticated ? "/dashboard" : registerHref}
                  className="btn-primary inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-2 border-[#0A192F] bg-[#0A192F] px-7 text-[0.98rem] font-bold tracking-[0.01em] text-white shadow-[0_10px_20px_rgba(10,25,47,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-[#1f366c] hover:bg-[#1f366c] hover:shadow-[0_14px_26px_rgba(10,25,47,0.18)] active:translate-y-0 active:shadow-none"
                >
                  {isAuthenticated
                    ? t("common.dashboard")
                    : t("landing.getStarted")}
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link
                  href="https://youtu.be/z8gAzje9ho4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-2 border-[#0A192F] bg-transparent px-7 text-[0.98rem] font-bold tracking-[0.01em] text-[#0A192F] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(10,25,47,0.06)] hover:shadow-[0_8px_16px_rgba(10,25,47,0.1)] active:translate-y-0 active:shadow-none"
                >
                  {t("landing.viewDemo")}
                </Link>
              </div>
            </div>

            <div
              className="hero-visual flex flex-1 justify-center lg:justify-end"
              data-reveal="right"
              style={revealDelay(220)}
            >
              <div className="image-container w-full max-w-[550px] overflow-hidden rounded-[24px] shadow-[0_20px_40px_rgba(10,25,47,0.08)]">
                <picture>
                  <source
                    media="(max-width: 769px)"
                    srcSet="/dashboard_sm.webp"
                  />
                  <source
                    media="(min-width: 770px)"
                    srcSet="/dashboard_md.webp"
                  />
                  <img
                    src="/dashboard_md.webp"
                    alt={t("landing.heroImageAlt")}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </picture>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-bar-section border-y border-[#E2E8F0] bg-white py-10">
          <div className="trust-bar-container mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-4 px-4 md:flex-row md:gap-6 lg:px-6">
            <div
              className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568]"
              data-reveal="up"
              style={revealDelay(90)}
            >
              <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
                {stat1Value}
              </strong>
              <span>{t("landing.stat1Desc")}</span>
            </div>
            <div className="trust-divider hidden h-10 w-px bg-[#CBD5E0] md:block" />
            <div
              className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568]"
              data-reveal="up"
              style={revealDelay(170)}
            >
              <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
                {t("landing.stat2")}
              </strong>
              <span>{t("landing.stat2Desc")}</span>
            </div>
            <div className="trust-divider hidden h-10 w-px bg-[#CBD5E0] md:block" />
            <div
              className="trust-metric flex flex-col items-center gap-1 text-center text-[#4A5568]"
              data-reveal="up"
              style={revealDelay(250)}
            >
              <strong className="text-[clamp(1.2rem,2vw,1.5rem)] font-extrabold text-[#0A192F]">
                {t("landing.stat3")}
              </strong>
              <span>{t("landing.stat3Desc")}</span>
            </div>
          </div>
        </section>

        <section
          className="services-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
          style={{ contentVisibility: "auto", containIntrinsicSize: "840px" }}
        >
          <div
            className="services-header mx-auto mb-14 max-w-[1200px] text-center"
            data-reveal="up"
          >
            <span className="services-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.8px] text-[#1f366c]">
              {t("landing.capabilities")}
            </span>
            <h2 className="services-title m-0 text-[clamp(1.7rem,2.8vw,2.5rem)] leading-[1.2] text-[#0A192F]">
              {t("landing.feature1Title")
                ? t("landing.ourPowerfulFeatures")
                : t("landing.features")}
            </h2>
          </div>
          <div className="services-grid mx-auto grid max-w-[1200px] gap-7 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                icon: Zap,
                title: t("landing.feature1Title"),
                desc: t("landing.feature1Desc"),
              },
              {
                icon: Settings,
                title: t("landing.feature2Title"),
                desc: t("landing.feature2Desc"),
              },
              {
                icon: ShieldCheck,
                title: t("landing.feature3Title"),
                desc: t("landing.feature3Desc"),
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="service-card flex flex-col rounded-[20px] border border-[rgba(10,25,47,0.08)] bg-white p-9 transition duration-200 hover:-translate-y-1.5 hover:border-[rgba(37,48,217,0.18)] hover:shadow-[0_18px_36px_rgba(10,25,47,0.1)]"
                data-reveal="zoom"
                style={revealDelay(120 + idx * 90)}
              >
                <div className="service-card-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(37,48,217,0.08)] text-[#2530D9]">
                  <feature.icon size={28} />
                </div>
                <h3 className="service-card-title mb-3 text-[1.2rem] font-bold leading-[1.3] text-[#0A192F]">
                  {feature.title}
                </h3>
                <p className="service-card-description m-0 text-[0.95rem] leading-[1.65] text-[#4A5568]">
                  {feature.desc}
                </p>
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
        <section
          className="why-choose-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
          style={{ contentVisibility: "auto", containIntrinsicSize: "780px" }}
        >
          <div className="why-choose-container mx-auto max-w-[1200px] text-center">
            <span
              className="why-choose-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
              data-reveal="up"
            >
              {t("landing.process")}
            </span>
            <h2
              className="why-choose-title mb-12 text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.2] text-[#0A192F]"
              data-reveal="up"
              style={revealDelay(100)}
            >
              {t("landing.howItWorks")}
            </h2>
            <div className="why-choose-grid grid gap-7 text-left xl:grid-cols-3">
              {[
                {
                  step: "01",
                  title: t("landing.step1Title"),
                  desc: t("landing.step1Desc"),
                },
                {
                  step: "02",
                  title: t("landing.step2Title"),
                  desc: t("landing.step2Desc"),
                },
                {
                  step: "03",
                  title: t("landing.step3Title"),
                  desc: t("landing.step3Desc"),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="why-choose-card relative rounded-[20px] border border-[rgba(10,25,47,0.06)] bg-white p-9 text-left shadow-[0_1px_3px_rgba(10,25,47,0.04),0_8px_24px_rgba(10,25,47,0.05)] transition duration-[260ms] hover:-translate-y-1.5 hover:border-[rgba(37,48,217,0.12)] hover:shadow-[0_4px_12px_rgba(10,25,47,0.06),0_20px_48px_rgba(10,25,47,0.1)]"
                  data-reveal="up"
                  style={revealDelay(110 + idx * 90)}
                >
                  <div className="why-choose-card-header mb-5 flex items-center gap-3.5">
                    <div className="why-choose-icon flex h-[52px] w-[52px] min-w-[52px] items-center justify-center rounded-full border border-[rgba(37,48,217,0.08)] bg-[linear-gradient(135deg,#eef1ff_0%,#f0f4f9_100%)] text-[1.25rem] font-extrabold text-[#2530D9]">
                      {item.step}
                    </div>
                    <h3 className="m-0 text-[1.2rem] font-bold tracking-[-0.01em] text-[#0A192F]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="m-0 text-[0.95rem] leading-[1.7] text-[#4A5568]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          className="about-us-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
          style={{ contentVisibility: "auto", containIntrinsicSize: "760px" }}
        >
          <div className="about-us-intro mx-auto mb-12 max-w-[1200px] text-center">
            <span
              className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
              data-reveal="up"
            >
              {t("landing.reviews")}
            </span>
            <h2
              className="about-us-headline m-0 text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.2] text-[#0A192F]"
              data-reveal="up"
              style={revealDelay(90)}
            >
              {t("landing.testimonialsTitle")}
            </h2>
          </div>
          <div className="about-us-pillars mx-auto grid max-w-[1200px] items-start gap-[clamp(1.25rem,3vw,2rem)] xl:grid-cols-3">
            {[
              {
                text: t("landing.testimonial1Text"),
                author: t("landing.testimonial1Author"),
                role: t("landing.testimonial1Role"),
                link: t("landing.testimonial1Link"),
              },
              {
                text: t("landing.testimonial2Text"),
                author: t("landing.testimonial2Author"),
                role: t("landing.testimonial2Role"),
                link: t("landing.testimonial2Link"),
              },
              {
                text: t("landing.testimonial3Text"),
                author: t("landing.testimonial3Author"),
                role: t("landing.testimonial3Role"),
                link: t("landing.testimonial3Link"),
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                onClick={() => toggleTestimonial(idx)}
                onKeyDown={(event) => {
                  if (event.currentTarget !== event.target) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleTestimonial(idx);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={expandedTestimonials.includes(idx)}
                className="about-us-card group flex h-fit w-full flex-col self-start rounded-[20px] border border-[rgba(10,25,47,0.07)] bg-white p-10 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(10,25,47,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2530D9] focus-visible:ring-offset-2"
                data-reveal="up"
                style={revealDelay(110 + idx * 85)}
              >
                <div className="about-us-card-author flex items-center gap-3">
                  <div className="about-us-card-avatar flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#2530D9] to-[#1f366c] font-bold text-white">
                    {testimonial.author[0]}
                  </div>
                  <div className="about-us-card-info">
                    {testimonial.link ? (
                      <a
                        href={testimonial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[0.95rem] font-bold text-[#0A192F] transition hover:text-[#2530D9] hover:underline"
                      >
                        {testimonial.author}
                        <ExternalLink
                          size={14}
                          className="ml-1 text-[#2530D9]"
                        />
                      </a>
                    ) : (
                      <h3 className="m-0 text-[0.95rem] font-bold text-[#0A192F]">
                        {testimonial.author}
                      </h3>
                    )}
                    <p className="m-0 text-[0.8rem] text-[#4A5568]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p
                  className={`testimonial-text mt-6 text-[1rem] italic leading-[1.7] text-[#4A5568] ${expandedTestimonials.includes(idx) ? "is-expanded" : ""}`}
                >
                  {testimonial.text}
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleTestimonial(idx);
                  }}
                  className="mt-5 inline-flex items-center text-[0.85rem] font-semibold text-[#2530D9] opacity-80 transition hover:opacity-100"
                >
                  {expandedTestimonials.includes(idx)
                    ? t("landing.hideMore")
                    : t("landing.readMore")}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section
          className="pricing-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
          style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }}
        >
          <div className="pricing-header mx-auto mb-16 max-w-[1200px] text-center">
            <span
              className="why-choose-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
              data-reveal="up"
            >
              {t("landing.pricing")}
            </span>
            <h2
              className="why-choose-title m-0 text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.2] text-[#0A192F]"
              data-reveal="up"
              style={revealDelay(100)}
            >
              {t("landing.pricingTitle")}
            </h2>
          </div>
          <div className="pricing-grid mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-3">
            {[
              {
                title: t("landing.pricingStarter"),
                price: t("landing.pricingStarterPrice"),
                desc: t("landing.pricingStarterDesc"),
                isPopular: false,
                period: t("landing.pricingHalfMonth"),
              },
              {
                title: t("landing.pricingPro"),
                price: t("landing.pricingProPrice"),
                desc: t("landing.pricingProDesc"),
                isPopular: true,
                period: t("landing.pricingMonth"),
              },
              {
                title: t("landing.pricingEnterprise"),
                price: t("landing.pricingEnterprisePrice"),
                desc: t("landing.pricingEnterpriseDesc"),
                isPopular: false,
                period: t("landing.pricingWeek"),
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`pricing-card flex flex-col rounded-[24px] border p-10 transition duration-200 hover:-translate-y-1.5 ${plan.isPopular ? "border-transparent bg-[linear-gradient(145deg,#0A192F_0%,#1f366c_100%)] text-white shadow-[0_20px_40px_rgba(10,25,47,0.2)] hover:shadow-[0_24px_48px_rgba(10,25,47,0.28)]" : "border-[rgba(10,25,47,0.08)] bg-white text-[#0A192F] hover:border-[rgba(37,48,217,0.15)] hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)]"}`}
                data-reveal={plan.isPopular ? "zoom" : "up"}
                style={revealDelay(120 + idx * 95)}
              >
                <h3
                  className={`m-0 mb-2 text-[1.3rem] font-bold ${plan.isPopular ? "text-white" : "text-[#0A192F]"}`}
                >
                  {plan.title}
                </h3>
                <p
                  className={`pricing-card-desc mb-6 text-[0.95rem] leading-[1.5] ${plan.isPopular ? "text-white/80" : "text-[#4A5568]"}`}
                >
                  {plan.desc}
                </p>
                <div className="pricing-price-wrap mb-8 flex items-baseline gap-1">
                  <span
                    className={`pricing-price text-[3rem] font-extrabold leading-none ${plan.isPopular ? "text-white" : "text-[#0A192F]"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`pricing-period text-[0.95rem] font-semibold ${plan.isPopular ? "text-white/70" : "text-[#4A5568]"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="pricing-features mb-8 flex flex-1 list-none flex-col gap-3 p-0">
                  {(pricingFeatureGroups[idx] || []).map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-3 text-[0.95rem] font-medium ${plan.isPopular ? "text-white/90" : "text-[#4A5568]"}`}
                    >
                      <i
                        className={
                          plan.isPopular ? "text-[#ff3d71]" : "text-[#2530D9]"
                        }
                      >
                        <Check size={16} />
                      </i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={isAuthenticated ? "/dashboard" : registerHref}
                  className={`inline-flex min-h-[3.25rem] items-center justify-center rounded-[0.625rem] border-2 px-7 text-[0.98rem] font-bold tracking-[0.01em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${plan.isPopular ? "border-[#0A192F] bg-[#0A192F] text-white shadow-[0_10px_20px_rgba(10,25,47,0.12)] hover:border-[#1f366c] hover:bg-[#1f366c] hover:shadow-[0_14px_26px_rgba(10,25,47,0.18)]" : "border-[#0A192F] bg-transparent text-[#0A192F] hover:bg-[rgba(10,25,47,0.06)] hover:shadow-[0_8px_16px_rgba(10,25,47,0.1)]"}`}
                >
                  {isAuthenticated
                    ? t("common.dashboard")
                    : t("landing.pricingBtn")}
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
