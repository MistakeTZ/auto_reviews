"use client";

import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Header from "@/components/spam/Header";
import HeroSection from "@/components/spam/HeroSection";
import TrustBarSection from "@/components/spam/TrustBarSection";
import SmartSchedulingSection from "@/components/spam/SmartSchedulingSection";
import AutoPauseSafetySection from "@/components/spam/AutoPauseSafetySection";
import BotAlertsSection from "@/components/spam/BotAlertsSection";
import HowItWorksSection from "@/components/spam/HowItWorksSection";
import PricingSection from "@/components/spam/PricingSection";
import FAQSection from "@/components/spam/FAQSection";
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

        {/* SmartSchedulingSection: Showcases automated frequency intervals, hours, and randomized offsets */}
        <SmartSchedulingSection t={t} />

        {/* AutoPauseSafetySection: Highlights the core event-driven reconciliation system */}
        {/* that catches client messages and automatically pauses active rules to mimic real human action */}
        <AutoPauseSafetySection t={t} />

        {/* BotAlertsSection: Spotlights deep integrations with interactive Telegram & MAX bots */}
        <BotAlertsSection t={t} language={language} />

        {/* HowItWorksSection: Walkthrough connecting Wildberries chat tokens safely */}
        <HowItWorksSection t={t} />

        {/* PricingSection: Renders YooKassa packages mapping to respam standalone or ultimate bundles */}
        <PricingSection
          t={t}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />

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
