"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutDashboard,
  MessageSquare,
  CircleHelp,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
  Megaphone,
  CreditCard,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const {
    isAuthenticated,
    jwtToken,
    logout,
    fetchMe,
    fetchProducts,
    fetchRules,
    fetchReviews,
    userName,
    apiToken,
    tariffType,
    hasActiveSubscription,
  } = useAppStore();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const getPlanBadge = () => {
    const planName = !hasActiveSubscription
      ? !apiToken
        ? "subscription.noToken"
        : "subscription.expiredPlan"
      : tariffType === "trial"
        ? "subscription.trialPlan"
        : "subscription.premiumPlanShort";

    const badgeClass = !hasActiveSubscription
      ? "text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200"
      : tariffType === "trial"
        ? "text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200"
        : "text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200";

    return <span className={badgeClass}>{t(planName)}</span>;
  };

  useEffect(() => {
    if (isAuthenticated && jwtToken) {
      fetchMe();
      fetchProducts();
      fetchRules();
      fetchReviews();
    }
  }, [
    isAuthenticated,
    jwtToken,
    fetchMe,
    fetchProducts,
    fetchRules,
    fetchReviews,
  ]);

  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/" || (!isAuthenticated && pathname !== "/demo"))
    return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isSpamMode = pathname.startsWith("/spam");
  const mode = isSpamMode ? "respam" : "reanswer";

  const linkClass = (path: string, activeSpam: boolean) => {
    const isActive = pathname === path;
    return `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
      isActive
        ? activeSpam
          ? "bg-violet-50 text-violet-700 font-semibold"
          : "bg-indigo-50 text-indigo-700 font-semibold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  const renderSidebarContent = (
    sidebarMode: "reanswer" | "respam",
    onClose?: () => void,
  ) => {
    const activeSpam = sidebarMode === "respam";
    const tabs = activeSpam
      ? [
          {
            href: "/spam",
            label: t("spam.dashboardTab"),
            icon: LayoutDashboard,
          },
          {
            href: "/spam/rules",
            label: t("spam.rulesTab"),
            icon: Megaphone,
          },
          {
            href: "/spam/settings",
            label: t("spam.settingsTab"),
            icon: Settings,
          },
          {
            href: "/spam/tariffs",
            label: t("spam.referralsTab"),
            icon: CreditCard,
          },
        ]
      : [
          {
            href: "/dashboard",
            label: t("common.dashboard"),
            icon: LayoutDashboard,
          },
          {
            href: "/reviews",
            label: t("common.reviewsInbox"),
            icon: MessageSquare,
          },
          {
            href: "/questions",
            label: t("common.questionsInbox"),
            icon: CircleHelp,
          },
          {
            href: "/rules",
            label: t("common.autoAnswerRules"),
            icon: ShieldAlert,
          },
          {
            href: "/settings",
            label: t("common.settings"),
            icon: Settings,
          },
          {
            href: "/referrals",
            label: t("referrals.title"),
            icon: Gift,
          },
        ];

    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo / Header */}
          <div className="relative group p-6 border-b border-slate-100/50 shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-left cursor-pointer">
                <h1
                  className={`text-2xl font-black tracking-tight transition-colors ${
                    activeSpam
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600"
                      : "text-indigo-600"
                  }`}
                >
                  {activeSpam ? "reSpam" : "reAnswer"}
                </h1>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Wildberries
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-rose-600 text-slate-500 transition-colors"
                  title="Close Menu"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Hover Switch Option */}
            <div className="absolute left-6 right-6 top-[72px] hidden group-hover:block z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {t("common.switchService")}
              </p>
              <Link
                href={activeSpam ? "/dashboard" : "/spam"}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  activeSpam
                    ? "text-indigo-600 hover:bg-indigo-50"
                    : "text-violet-600 hover:bg-violet-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeSpam
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {activeSpam ? (
                    <MessageSquare size={16} />
                  ) : (
                    <Megaphone size={16} />
                  )}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="font-bold text-slate-800 leading-none">
                    {activeSpam ? "reAnswer" : "reSpam"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-1">
                    {activeSpam
                      ? t("common.reviewsAndAI")
                      : t("common.chatCampaigns")}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={onClose}
                  className={linkClass(tab.href, activeSpam)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info / Profile Section */}
        <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200 shrink-0">
              {(userName || t("common.sellerAccount"))[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                {userName || t("common.sellerAccount")}
              </p>
              <div className="mt-1">{getPlanBadge()}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (onClose) onClose();
              handleLogout();
            }}
            className="flex items-center justify-center space-x-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100"
          >
            <LogOut size={16} />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-6 md:hidden shadow-sm">
        <button
          onClick={() => setIsOpen(true)}
          className={`p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 ${
            isSpamMode
              ? "text-slate-600 hover:text-violet-600"
              : "text-slate-600 hover:text-indigo-600"
          }`}
          title="Open Menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="text-center">
          <h1
            className={`text-xl font-black tracking-tight leading-none ${
              isSpamMode ? "text-violet-600" : "text-indigo-600"
            }`}
          >
            {isSpamMode ? "reSpam" : "reAnswer"}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Wildberries
          </p>
        </Link>

        <div className="w-10" aria-hidden="true" />
      </header>

      {/* Mobile Drawer Overlay / Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 flex flex-col shadow-2xl md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-hidden">
          {renderSidebarContent(mode, () => setIsOpen(false))}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:block border-r border-slate-200 bg-white shadow-sm shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden z-10">
          {renderSidebarContent(mode)}
        </div>
      </aside>
    </>
  );
}
