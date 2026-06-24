"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import CookieBanner from "@/components/layout/CookieBanner";
import AppFooter from "@/components/layout/AppFooter";

const PUBLIC_PATHS = new Set([
  "/",
  "/spam",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/consent",
  "/legal",
  "/amo/policy"
]);
const DARK_FOOTER_PATHS = new Set(["/", "/spam", "/privacy", "/consent", "/legal", "/amo/policy"]);
const COMPACT_FOOTER_PATHS = new Set(["/privacy", "/consent", "/legal", "/amo/policy"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { jwtToken } = useAppStore();

  const hideDashboard = PUBLIC_PATHS.has(pathname);
  const useDarkFooter = DARK_FOOTER_PATHS.has(pathname);
  const useCompactFooter = COMPACT_FOOTER_PATHS.has(pathname);
  const footerClassName = (pathname === "/" || pathname === "/spam") ? "site-footer" : "";

  useEffect(() => {
    // If trying to access a protected route without a jwtToken, redirect to login
    if (!hideDashboard && !jwtToken) {
      router.push("/login");
    }
  }, [hideDashboard, jwtToken, router]);

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
