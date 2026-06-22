"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import FlagSwitcher from "@/components/ui/FlagSwitcher";
import { useScrolled } from "@/hooks/useScrolled";

type HeaderProps = {
  t: (key: string) => string;
  toggleLanguage: () => void;
  isAuthenticated: boolean;
  registerHref: string;
};

export default function Header({
  t,
  toggleLanguage,
  isAuthenticated,
  registerHref,
}: HeaderProps) {
  const scrolled = useScrolled(10);

  return (
    <header
      className={`site-header ${scrolled ? "scrolled" : ""} sticky top-0 z-[1000] w-full bg-white/95 backdrop-blur-xl`}
    >
      <div className="header-container mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-4 py-5 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="hidden min-[400px]:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
            <MessageCircle size={20} className="text-white" />
          </div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-black tracking-tight text-transparent">
            {t("landing.brandName")}
          </h1>
        </div>

        <div className="header-cta flex items-center justify-end gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center rounded-xl p-1.5 transition-colors hover:bg-slate-100 cursor-pointer"
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
  );
}
