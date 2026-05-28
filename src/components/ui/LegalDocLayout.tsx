"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import FlagSwitcher from "@/components/ui/FlagSwitcher";

interface LegalDocLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
}

export default function LegalDocLayout({
  children,
  title,
  subtitle,
  lastUpdated,
}: LegalDocLayoutProps) {
  const { t, language, setLanguage } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sticky Premium Header */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 z-30 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <MessageCircle size={18} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              reAnswer
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center border border-transparent hover:border-slate-200"
              title={t("landing.toggleLanguage")}
            >
              <FlagSwitcher />
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              <span>{t("common.backToHome")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-28 pb-20 px-6 max-w-4xl w-full mx-auto flex flex-col">
        {/* Document Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-800 mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-slate-600 font-medium max-w-2xl">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-4">
              {lastUpdated}
            </p>
          )}
        </div>

        {/* Beautiful Glassmorphic Card for the Document Content */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 md:p-10 leading-relaxed text-slate-700 space-y-6 prose prose-slate max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
