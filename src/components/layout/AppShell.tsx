"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import CookieBanner from "@/components/layout/CookieBanner";
import AppFooter from "@/components/layout/AppFooter";

const NO_DASHBOARD_PATHS = new Set(["/", "/spam", "/privacy", "/consent", "/legal", "/amo/policy"]);
const DARK_FOOTER_PATHS = new Set(["/", "/spam", "/privacy", "/consent", "/legal", "/amo/policy"]);
const COMPACT_FOOTER_PATHS = new Set(["/privacy", "/consent", "/legal", "/amo/policy"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideDashboard = NO_DASHBOARD_PATHS.has(pathname);
  const useDarkFooter = DARK_FOOTER_PATHS.has(pathname);
  const useCompactFooter = COMPACT_FOOTER_PATHS.has(pathname);
  const footerClassName = (pathname === "/" || pathname === "/spam") ? "site-footer" : "";

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex flex-1 min-h-0 w-full">
        {!hideDashboard && <Sidebar />}
        <div className="flex-1 min-w-0 w-full flex flex-col">{children}</div>
      </div>
      <AppFooter
        variant={useDarkFooter ? "dark" : "light"}
        compactBrand={useCompactFooter}
        className={footerClassName}
      />
      <CookieBanner />
    </div>
  );
}
