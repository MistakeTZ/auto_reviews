"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AppFooterProps {
  variant?: "dark" | "light";
  className?: string;
  compactBrand?: boolean;
}

export default function AppFooter({
  variant = "light",
  className = "",
  compactBrand = false,
}: AppFooterProps) {
  const { t } = useTranslation();

  const isDark = variant === "dark";

  const footerBaseClass = isDark
    ? "py-8 px-6 bg-gradient-to-b from-slate-900/95 to-slate-900 border-t border-slate-800 text-slate-400"
    : "px-4 md:px-8 py-6 border-t border-slate-200 bg-white/70 text-slate-500";

  const containerClass = isDark
    ? "max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
    : "max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-sm";

  const brandIconClass = compactBrand
    ? "w-6 h-6 rounded bg-white/10 flex items-center justify-center"
    : "w-8 h-8 rounded-lg bg-white flex items-center justify-center";

  const brandIconSize = compactBrand ? 12 : 16;

  const brandTextClass = isDark
    ? "font-bold text-white tracking-tight"
    : "font-bold text-slate-900 tracking-tight";

  const linksClass = isDark
    ? "flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-400"
    : "flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold";

  const linkClass = isDark
    ? "hover:text-white transition-colors"
    : "hover:text-slate-700 transition-colors";

  const rightsClass = isDark ? "text-xs text-slate-500" : "font-medium";

  return (
    <footer className={`${footerBaseClass} ${className}`.trim()}>
      <div className={containerClass}>
        <div className="flex items-center gap-2">
          <div className={brandIconClass}>
            <MessageCircle size={brandIconSize} className={isDark ? "text-white" : "text-slate-900"} />
          </div>
          <span className={brandTextClass}>reAnswer</span>
        </div>

        <div className={linksClass}>
          <Link href="https://t.me/+375259863436" className={linkClass} target="_blank" rel="noopener noreferrer">
            {t("common.contact")}
          </Link>
          <Link href="/privacy" className={linkClass}>
            {t("common.privacyPolicy")}
          </Link>
          <Link href="/consent" className={linkClass}>
            {t("common.personalDataConsent")}
          </Link>
          <Link href="/legal" className={linkClass}>
            {t("common.legalInfo")}
          </Link>
        </div>

        <p className={rightsClass}>{t("landing.footerRights")}</p>
      </div>
    </footer>
  );
}
