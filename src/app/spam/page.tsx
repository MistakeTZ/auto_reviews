"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Megaphone, CheckCircle, Loader2 } from "lucide-react";
import { SpamStats, SpamSentMessage } from "./types";

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
    <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("spam.title")}
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {t("spam.timeRange")}
        </p>
      </div>

      {loadingStats && stats.total_rules === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={36} className="animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mr-4">
                  <Megaphone size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {t("spam.activeRules")}
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
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
                  <p className="text-2xl font-black text-slate-900 mt-1">
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
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {loadingStats ? "..." : stats.sent_last_24h}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Sent Messages */}
          <Card>
            <CardHeader className="flex justify-between items-center border-b border-slate-100">
              <CardTitle className="text-lg font-bold">
                {t("spam.lastSentMessages")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lastSent.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {t("spam.noSentMessages")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold">{t("spam.chatId")}</th>
                        <th className="px-6 py-3 font-semibold">{t("spam.text")}</th>
                        <th className="px-6 py-3 font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lastSent.map((msg) => (
                        <tr key={msg.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                            {msg.chat_id}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900 text-xs max-w-xs truncate">
                            {msg.text}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs shrink-0">
                            {new Date(msg.sent_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

