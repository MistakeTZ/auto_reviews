"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import {
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
} from "lucide-react";
import { SpamTemplate } from "../types";
import HelpSection from "@/components/settings/HelpSection";
import NotificationMethodsSection from "@/components/settings/NotificationMethodsSection";

export default function SpamSettingsPage() {
  const {
    jwtToken,
    hasWbChatApiToken,
    notifyAnswersInChats,
    notifyAllMessages,
    fetchMe,
  } = useAppStore();
  const { t } = useTranslation();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  // Settings State
  const [chatTokenInput, setChatTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [notifyAnswers, setNotifyAnswers] = useState(true);
  const [notifyAll, setNotifyAll] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Global Template Creator State
  const [globalTemplates, setGlobalTemplates] = useState<SpamTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [newTplText, setNewTplText] = useState("");
  const [newTplStart, setNewTplStart] = useState<number | "">("");
  const [newTplEnd, setNewTplEnd] = useState<number | "">("");
  const [addingTemplate, setAddingTemplate] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!jwtToken) return;
    setLoadingTemplates(true);
    try {
      const res = await fetch(`${API_URL}/chats/templates`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalTemplates(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTemplates(false);
    }
  }, [jwtToken, API_URL]);

  useEffect(() => {
    if (jwtToken) {
      fetchMe();
      setTimeout(() => {
        loadTemplates();
        setNotifyAnswers(notifyAnswersInChats);
        setNotifyAll(notifyAllMessages);
      }, 0);
    }
  }, [
    jwtToken,
    notifyAnswersInChats,
    notifyAllMessages,
    fetchMe,
    loadTemplates,
  ]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        notify_answers_in_chats: notifyAnswers,
        notify_all_messages: notifyAll,
      };
      if (chatTokenInput.trim()) {
        payload.wb_chat_api_token = chatTokenInput.trim();
      }
      const res = await fetch(`${API_URL}/chats/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setChatTokenInput("");
        await fetchMe();
        alert(t("common.save"));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Error saving settings");
      }
    } catch {
      alert(t("auth.connectionError"));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddGlobalTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplText.trim()) return;
    setAddingTemplate(true);
    try {
      const res = await fetch(`${API_URL}/chats/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          text: newTplText,
          start_hour: newTplStart === "" ? null : newTplStart,
          end_hour: newTplEnd === "" ? null : newTplEnd,
          is_global: true,
        }),
      });
      if (res.ok) {
        setNewTplText("");
        setNewTplStart("");
        setNewTplEnd("");
        await loadTemplates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm(t("common.delete") + "?")) return;
    try {
      const res = await fetch(`${API_URL}/chats/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        await loadTemplates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-24 px-4 pb-12 md:p-8 w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("spam.settingsTab")}
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {t("spam.settings")}
        </p>
      </div>

      <div className="space-y-8">
        {/* API Config Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 space-y-6 shadow-sm shadow-slate-200/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {t("settings.wbApiIntegrationChat")}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {t("settings.connectApiForAutomation")}
              </p>
            </div>
            {hasWbChatApiToken ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/60 text-xs font-extrabold tracking-tight shrink-0 w-fit">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>{t("settings.apiConnectedSuccess")}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-extrabold tracking-tight shrink-0 w-fit">
                <AlertCircle size={14} className="text-rose-600" />
                <span>{t("settings.apiNotConnected")}</span>
              </div>
            )}
          </div>

          {/* Inner Card API Token Settings */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  {t("spam.chatToken")}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {t("spam.chatTokenDescription")}
                </p>
              </div>

              {/* Guide Button linking to standalone instructions page */}
              <Link
                href="/settings/instructions?from=spam"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-indigo-100 rounded-2xl text-xs font-extrabold text-indigo-700 hover:text-indigo-800 transition-all shadow-sm shrink-0 w-fit"
              >
                <span>{t("settings.instruction")}</span>
                <ExternalLink size={12} className="stroke-[2.5]" />
              </Link>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t("spam.chatTokenLabel")}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showToken ? "text" : "password"}
                    value={chatTokenInput}
                    onChange={(e) => setChatTokenInput(e.target.value)}
                    placeholder={
                      hasWbChatApiToken
                        ? "••••••••••••••••••••••••••••••••••••••••"
                        : t("spam.chatTokenPlaceholder")
                    }
                    className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800 font-mono text-sm tracking-wide shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    title={showToken ? "Hide token" : "Show token"}
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-2">
                  {t("settings.neverShareToken")}
                </p>
              </div>

              {/* Flags */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyAnswers}
                    onChange={(e) => setNotifyAnswers(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    {t("spam.notifyAnswers")}
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyAll}
                    onChange={(e) => setNotifyAll(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    {t("spam.notifyAll")}
                  </span>
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {savingSettings ? "..." : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Template Creator Form */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 space-y-6 shadow-sm shadow-slate-200/40">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug pb-3 border-b border-slate-100 flex items-center gap-2">
            <Plus size={18} className="text-indigo-600 stroke-[2.5]" />
            <span>{t("spam.addTemplate")}</span>
          </h3>

          <form onSubmit={handleAddGlobalTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t("spam.text")}
              </label>
              <textarea
                value={newTplText}
                onChange={(e) => setNewTplText(e.target.value)}
                placeholder={t("spam.templateTextPlaceholder")}
                rows={4}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none text-slate-800 text-sm font-medium transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t("spam.templateStartHour")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={newTplStart}
                  onChange={(e) =>
                    setNewTplStart(
                      e.target.value === ""
                        ? ""
                        : Math.min(
                            23,
                            Math.max(0, parseInt(e.target.value) || 0),
                          ),
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t("spam.templateEndHour")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={newTplEnd}
                  onChange={(e) =>
                    setNewTplEnd(
                      e.target.value === ""
                        ? ""
                        : Math.min(
                            23,
                            Math.max(0, parseInt(e.target.value) || 0),
                          ),
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addingTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {addingTemplate ? "..." : t("spam.addTemplate")}
            </button>
          </form>
        </div>

        {/* Global Templates List Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 space-y-6 shadow-sm shadow-slate-200/40">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {t("spam.globalTemplates")}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {t("spam.globalTemplatesDescription")}
            </p>
          </div>

          {loadingTemplates ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 size={28} className="animate-spin text-indigo-600" />
            </div>
          ) : globalTemplates.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-2xl">
              {t("spam.noTemplatesCreated")}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {globalTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex justify-between items-center py-4 first:pt-0 last:pb-0 group"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {tpl.text}
                    </p>
                    {tpl.start_hour !== null && (
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        <span>
                          {t("spam.allowedHours")} {tpl.start_hour}:00 -{" "}
                          {tpl.end_hour}:00 (MSK)
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 opacity-60 group-hover:opacity-100 hover:opacity-100 transition-all"
                    title={t("spam.deleteTemplateTitle")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <NotificationMethodsSection />
        <HelpSection />
      </div>
    </div>
  );
}
