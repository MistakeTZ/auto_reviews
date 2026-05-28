"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import CookieBanner from "@/components/layout/CookieBanner";

const NO_DASHBOARD_PATHS = new Set(["/privacy", "/consent", "/legal"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideDashboard = NO_DASHBOARD_PATHS.has(pathname);

  return (
    <>
      {!hideDashboard && <Sidebar />}
      <div className="flex-1 min-w-0 overflow-y-auto w-full flex flex-col">{children}</div>
      <CookieBanner />
    </>
  );
}
