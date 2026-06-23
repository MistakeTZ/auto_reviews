"use client";

import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Header from "@/components/spam/Header";
import HeroSection from "@/components/spam/HeroSection";
import TrustBarSection from "@/components/spam/TrustBarSection";
import AutomationBentoSection from "@/components/spam/AutomationBentoSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import DemoVideoSection from "@/components/spam/DemoVideoSection";
import HowItWorksSection from "@/components/spam/HowItWorksSection";
import PricingSection from "@/components/spam/PricingSection";
import FAQSection from "@/components/spam/FAQSection";
import OtherServicesSection from "@/components/landing/OtherServicesSection";
import "../landing.css";

function ReSpamLandingPageContent() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { t, language, setLanguage } = useTranslation();
  const searchParams = useSearchParams();

  // Extract referral parameters to track user acquisition sources
  const referralCodeFromUrl = searchParams.get("ref")?.trim() || "";
  // Default to "respam" source if no source parameter is explicitly provided
  // to ensure users route to respam subscription records during registration bonuses
  const referralSourceFromUrl = searchParams.get("source")?.trim() || "respam";

  const registerHref = referralCodeFromUrl
    ? `/register?ref=${encodeURIComponent(referralCodeFromUrl)}&source=${encodeURIComponent(referralSourceFromUrl)}`
    : `/register?source=${encodeURIComponent(referralSourceFromUrl)}`;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("pendingReferralSource", referralSourceFromUrl);
    if (referralCodeFromUrl) {
      localStorage.setItem("pendingReferralCode", referralCodeFromUrl);
    }
  }, [referralCodeFromUrl, referralSourceFromUrl]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  return (
    <div
      className={`landing-page landing-shell ${
        isVisible ? "is-visible" : ""
      } w-full bg-white font-[var(--font-main)] text-[#0A192F]`}
    >
      <Header
        t={t}
        toggleLanguage={toggleLanguage}
        isAuthenticated={isAuthenticated}
        registerHref={registerHref}
      />

      <main className="relative overflow-hidden">
        {/* Hero Section: Hooking Wildberries sellers with automated retention benefits */}
        <HeroSection
          t={t}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />

        {/* TrustBarSection: Showcase brand safety and operational metrics */}
        <TrustBarSection t={t} language={language} />

        {/* AutomationBentoSection: Unified scheduling, auto-pause safety, and Telegram alerts in one bento grid */}
        <AutomationBentoSection t={t} />

        {/* TestimonialsSection: Loved by Sellers reviews */}
        <TestimonialsSection t={t} prefix="spamLanding" />

        <DemoVideoSection t={t} />

        {/* HowItWorksSection: Walkthrough connecting Wildberries chat tokens safely */}
        <HowItWorksSection t={t} />

        {/* PricingSection: Renders YooKassa packages mapping to respam standalone or ultimate bundles */}
        <PricingSection
          t={t}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />

        {/* OtherServicesSection: Link back to reAnswer */}
        <OtherServicesSection t={t} isAuthenticated={isAuthenticated} targetService="reanswer" />

        {/* FAQSection: Address technical token protections and webhook safety constraints */}
        <FAQSection t={t} />
      </main>
    </div>
  );
}

export default function ReSpamLandingPage() {
  return (
    <Suspense>
      <ReSpamLandingPageContent />
    </Suspense>
  );
}
