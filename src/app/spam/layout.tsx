"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function SpamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

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

      {/* Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
