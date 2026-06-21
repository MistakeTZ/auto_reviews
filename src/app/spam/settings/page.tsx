"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { SpamTemplate } from "../types";

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
      alert("Connection error");
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
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Config Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {t("spam.settings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Chat Token */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {t("spam.chatToken")}
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={chatTokenInput}
                      onChange={(e) => setChatTokenInput(e.target.value)}
                      placeholder={
                        hasWbChatApiToken
                          ? "**************** (configured)"
                          : "Enter WB API Token with scope 9"
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Flags */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyAnswers}
                      onChange={(e) => setNotifyAnswers(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {t("spam.notifyAnswers")}
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyAll}
                      onChange={(e) => setNotifyAll(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {t("spam.notifyAll")}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button type="submit" disabled={savingSettings}>
                    {savingSettings ? "..." : t("common.save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Global Templates List Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {t("spam.globalTemplates")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTemplates ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 size={24} className="animate-spin text-indigo-600" />
                </div>
              ) : globalTemplates.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {t("spam.noTemplatesCreated")}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {globalTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {tpl.text}
                        </p>
                        {tpl.start_hour !== null && (
                          <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                            {t("spam.allowedHours")} {tpl.start_hour}:00 -{" "}
                            {tpl.end_hour}:00 (MSK)
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Creator Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {t("spam.addTemplate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGlobalTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {t("spam.text")}
                  </label>
                  <textarea
                    value={newTplText}
                    onChange={(e) => setNewTplText(e.target.value)}
                    placeholder={t("spam.templateTextPlaceholder")}
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Start Hour (0-23 MSK)
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
                      className="w-full px-4 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      End Hour (0-23 MSK)
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
                      className="w-full px-4 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addingTemplate}
                >
                  {addingTemplate ? "..." : t("spam.addTemplate")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
