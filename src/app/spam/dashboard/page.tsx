"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Megaphone, CheckCircle, Loader2 } from "lucide-react";
import { SpamStats, SpamSentMessage } from "../types";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { formatDateTime } from "@/lib/formatDateTime";

export default function SpamDashboardPage() {
  const { jwtToken } = useAppStore();
  const { t } = useTranslation();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  const [stats, setStats] = useState<SpamStats>({
    total_rules: 0,
    active_rules: 0,
    total_sent: 0,
    sent_last_24h: 0,
  });
  const [lastSent, setLastSent] = useState<SpamSentMessage[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!jwtToken) return;
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_URL}/chats/stats`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLastSent(data.lastSentMessages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, [jwtToken, API_URL]);

  useEffect(() => {
    if (jwtToken) {
      setTimeout(() => {
        loadDashboardData();
      }, 0);
    }
  }, [jwtToken, loadDashboardData]);

  return (
    <SubscriptionGuard>
      <>
        <div className="pt-24 px-4 pb-8 md:p-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            {t("spam.title")}
          </h1>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed mb-8">
            {t("spam.about")}
          </p>

          {loadingStats && stats.total_rules === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={36} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mr-4">
                      <Megaphone size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-semibold">
                        {t("spam.activeRules")}
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        {loadingStats
                          ? "..."
                          : `${stats.active_rules} / ${stats.total_rules}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600 mr-4">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-semibold">
                        {t("spam.totalSent")}
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        {loadingStats ? "..." : stats.total_sent}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600 mr-4">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-semibold">
                        {t("spam.sentLast24h")}
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        {loadingStats ? "..." : stats.sent_last_24h}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Last Sent Messages */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle>{t("spam.lastSentMessages")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {lastSent.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {t("spam.noSentMessages")}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lastSent.map((msg) => (
                        <div
                          key={msg.id}
                          className="flex items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                          <div className="w-2.5 h-2.5 mt-2 rounded-full mr-3 shrink-0 bg-emerald-500 shadow-sm shadow-emerald-200" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-slate-800 text-sm">
                                {t("spam.chatId")}:{" "}
                                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                                  {msg.chat_id}
                                </span>
                              </p>
                              <span className="text-xs text-slate-400 shrink-0 ml-4 font-semibold">
                                {formatDateTime(msg.sent_at)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2 font-medium bg-slate-50 border border-slate-100/60 p-3.5 rounded-2xl italic leading-relaxed">
                              &ldquo;{msg.text}&rdquo;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </>
    </SubscriptionGuard>
  );
}
