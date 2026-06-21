"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LayoutDashboard,
  Megaphone,
  Settings as SettingsIcon,
  CreditCard,
} from "lucide-react";

export default function SpamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const tabs = [
    {
      id: "dashboard",
      label: t("spam.dashboardTab"),
      href: "/spam",
      icon: LayoutDashboard,
    },
    {
      id: "rules",
      label: t("spam.rulesTab"),
      href: "/spam/rules",
      icon: Megaphone,
    },
    {
      id: "settings",
      label: t("spam.settingsTab"),
      href: "/spam/settings",
      icon: SettingsIcon,
    },
    {
      id: "tariffs",
      label: t("spam.referralsTab"),
      href: "/spam/tariffs",
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {t("spam.title")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t("spam.timeRange")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl max-w-md shrink-0 border border-slate-200/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
