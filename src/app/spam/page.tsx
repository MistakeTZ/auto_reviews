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

  if (loadingStats && stats.total_rules === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={36} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Megaphone size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {t("spam.activeRules")}
              </p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {loadingStats
                  ? "..."
                  : `${stats.active_rules} / ${stats.total_rules}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {t("spam.totalSent")}
              </p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {loadingStats ? "..." : stats.total_sent}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {t("spam.sentLast24h")}
              </p>
              <p className="text-2xl font-black text-slate-800 mt-1">
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
            <div className="text-center py-8 text-slate-400">
              {t("spam.noSentMessages")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-semibold">{t("spam.chatId")}</th>
                    <th className="px-6 py-3 font-semibold">{t("spam.text")}</th>
                    <th className="px-6 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lastSent.map((msg) => (
                    <tr key={msg.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {msg.chat_id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 text-xs max-w-xs truncate">
                        {msg.text}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs shrink-0">
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
    </div>
  );
}
