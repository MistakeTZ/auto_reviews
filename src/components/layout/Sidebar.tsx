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
  Send,
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

  const linkClass = (path: string) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
      pathname === path
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-6 md:hidden shadow-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>
        <a href="/" className="text-center">
          <h1 className="text-xl font-black text-indigo-600 tracking-tight leading-none">
            reAnswer
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Wildberries
          </p>
        </a>

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
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <a href="/" className="text-left">
            <h1 className="text-2xl font-black text-indigo-600 tracking-tight">
              reAnswer
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Wildberries
            </p>
          </a>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-rose-600 text-slate-500 transition-colors"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={linkClass("/dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>{t("common.dashboard")}</span>
          </Link>
          <Link
            href="/reviews"
            onClick={() => setIsOpen(false)}
            className={linkClass("/reviews")}
          >
            <MessageSquare size={18} />
            <span>{t("common.reviewsInbox")}</span>
          </Link>
          <Link
            href="/questions"
            onClick={() => setIsOpen(false)}
            className={linkClass("/questions")}
          >
            <CircleHelp size={18} />
            <span>{t("common.questionsInbox")}</span>
          </Link>
          <Link
            href="/rules"
            onClick={() => setIsOpen(false)}
            className={linkClass("/rules")}
          >
            <ShieldAlert size={18} />
            <span>{t("common.autoAnswerRules")}</span>
          </Link>
          <Link
            href="/spam"
            onClick={() => setIsOpen(false)}
            className={linkClass("/spam")}
          >
            <Send size={18} />
            <span>{t("common.spamDistribution")}</span>
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={linkClass("/settings")}
          >
            <Settings size={18} />
            <span>{t("common.settings")}</span>
          </Link>
          <Link
            href="/referrals"
            onClick={() => setIsOpen(false)}
            className={linkClass("/referrals")}
          >
            <Gift size={18} />
            <span>{t("referrals.title")}</span>
          </Link>
        </nav>

        <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
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
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center justify-center space-x-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100"
          >
            <LogOut size={16} />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:block border-r border-slate-200 bg-white shadow-sm">
        <div className="sticky top-0 h-screen grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden z-10">
          <div className="p-6 flex justify-left items-center">
            <a href="/" className="text-left">
              <h1 className="text-2xl font-black text-indigo-600 tracking-tight">
                reAnswer
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Wildberries
              </p>
            </a>
          </div>

          <nav className="min-h-0 overflow-y-auto px-4 space-y-1.5 mt-2">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard size={18} />
              <span>{t("common.dashboard")}</span>
            </Link>

            <Link href="/reviews" className={linkClass("/reviews")}>
              <MessageSquare size={18} />
              <span>{t("common.reviewsInbox")}</span>
            </Link>

            <Link href="/questions" className={linkClass("/questions")}>
              <CircleHelp size={18} />
              <span>{t("common.questionsInbox")}</span>
            </Link>

            <Link href="/rules" className={linkClass("/rules")}>
              <ShieldAlert size={18} />
              <span>{t("common.autoAnswerRules")}</span>
            </Link>

            <Link href="/spam" className={linkClass("/spam")}>
              <Send size={18} />
              <span>{t("common.spamDistribution")}</span>
            </Link>

            <Link href="/settings" className={linkClass("/settings")}>
              <Settings size={18} />
              <span>{t("common.settings")}</span>
            </Link>

            <Link href="/referrals" className={linkClass("/referrals")}>
              <Gift size={18} />
              <span>{t("referrals.title")}</span>
            </Link>
          </nav>

          <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
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
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100"
            >
              <LogOut size={16} />
              <span>{t("common.logout")}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
