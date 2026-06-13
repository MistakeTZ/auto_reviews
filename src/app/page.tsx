"use client";

import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import TrustBarSection from "@/components/landing/TrustBarSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ScenariosSection from "@/components/landing/ScenariosSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SecurityGuaranteesSection from "@/components/landing/SecurityGuaranteesSection";
import PricingSection from "@/components/landing/PricingSection";
import "./landing.css";

function LandingPageContent() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { t, language, setLanguage } = useTranslation();
  const searchParams = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref")?.trim() || "";
  const registerHref = referralCodeFromUrl
    ? `/register?ref=${encodeURIComponent(referralCodeFromUrl)}`
    : "/register";

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
    if (!referralCodeFromUrl) {
      return;
    }
    localStorage.setItem("pendingReferralCode", referralCodeFromUrl);
  }, [referralCodeFromUrl]);

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
        <HeroSection
          t={t}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />
        <TrustBarSection t={t} language={language} />
        <FeaturesSection t={t} />
        <TestimonialsSection t={t} />
        <ScenariosSection
          t={t}
          language={language}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />
        <HowItWorksSection t={t} />
        <SecurityGuaranteesSection t={t} />
        <PricingSection
          t={t}
          isAuthenticated={isAuthenticated}
          registerHref={registerHref}
        />
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
