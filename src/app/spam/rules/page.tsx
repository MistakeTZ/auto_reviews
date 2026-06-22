"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Eye,
  Check,
  Info,
  Calendar,
  Clock,
  MessageSquare,
} from "lucide-react";
import { SpamRule, SpamTemplate, SpamSentMessage } from "../types";
import SubscriptionGuard from "@/components/layout/SubscriptionGuard";
import { formatDateTime } from "@/lib/formatDateTime";

export default function SpamRulesPage() {
  const { jwtToken } = useAppStore();
  const { t } = useTranslation();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  // Rules list state
  const [rules, setRules] = useState<SpamRule[]>([]);
  const [globalTemplates, setGlobalTemplates] = useState<SpamTemplate[]>([]);
  const [sentHistory, setSentHistory] = useState<
    Record<number, SpamSentMessage[]>
  >({});

  // Loading indicators
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Form State
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [chatId, setChatId] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedChats, setSelectedChats] = useState<
    { chatID: string; clientName: string }[]
  >([]);
  const [isManualInput, setIsManualInput] = useState(false);
  const [validatingChat, setValidatingChat] = useState(false);
  const [chatValidationMsg, setChatValidationMsg] = useState("");
  const [frequencyType, setFrequencyType] = useState<
    "four_times" | "three_times" | "twice" | "once" | "custom_days"
  >("four_times");
  const [sendHoursInput, setSendHoursInput] = useState("9,13,17,21");
  const [intervalDays, setIntervalDays] = useState(1);
  const [specificHour, setSpecificHour] = useState(9);
  const [spamNotEndlessly, setSpamNotEndlessly] = useState(true);
  const [ruleActive, setRuleActive] = useState(true);
  const [selectedGlobalTplIds, setSelectedGlobalTplIds] = useState<number[]>(
    [],
  );
  const [ruleSpecificTexts, setRuleSpecificTexts] = useState<string[]>([]);
  const [newSpecificText, setNewSpecificText] = useState("");
  const [savingRule, setSavingRule] = useState(false);

  // Filters & Sorting State
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"last_sent" | "new" | "old">("last_sent");

  const [recentChats, setRecentChats] = useState<
    { chatID: string; clientName: string; lastMessageText: string }[]
  >([]);
  const [loadingRecentChats, setLoadingRecentChats] = useState(false);
  const [recentChatsError, setRecentChatsError] = useState("");

  const loadRecentChats = useCallback(async () => {
    if (!jwtToken) return;
    setLoadingRecentChats(true);
    setRecentChatsError("");
    try {
      const res = await fetch(`${API_URL}/chats/recent`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecentChats(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setRecentChatsError(errData.detail || "Failed to load recent chats.");
      }
    } catch {
      setRecentChatsError("Failed to fetch recent chats.");
    } finally {
      setLoadingRecentChats(false);
    }
  }, [jwtToken, API_URL]);

  const loadRules = useCallback(async () => {
    if (!jwtToken) return;
    setLoadingRules(true);
    try {
      const res = await fetch(`${API_URL}/chats/rules`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRules(false);
    }
  }, [jwtToken, API_URL]);

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

  const fetchRuleHistory = async (ruleId: number) => {
    if (!jwtToken) return;
    try {
      const res = await fetch(
        `${API_URL}/chats/sent-messages?rule_id=${ruleId}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setSentHistory((prev) => ({ ...prev, [ruleId]: data }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (jwtToken) {
      setTimeout(() => {
        loadRules();
        loadTemplates();
      }, 0);
    }
  }, [jwtToken, loadRules, loadTemplates]);

  // Chat ID validation debouncer (only for manual input mode)
  useEffect(() => {
    if (!isManualInput || !chatId.trim()) {
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setValidatingChat(true);
      setChatValidationMsg(t("spam.checkingChat"));
      try {
        let normalizedChatId = chatId.trim();
        if (!normalizedChatId.startsWith("1:")) {
          normalizedChatId = `1:${normalizedChatId}`;
        }
        const res = await fetch(
          `${API_URL}/chats/validate-id?chat_id=${encodeURIComponent(normalizedChatId)}`,
          { headers: { Authorization: `Bearer ${jwtToken}` } },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            setClientName(data.clientName);
            setChatValidationMsg("");
          } else {
            setClientName("");
            setChatValidationMsg(t("spam.chatNotFound"));
          }
        } else {
          const data = await res.json().catch(() => ({}));
          setChatValidationMsg(data.detail || "Error validating chat ID");
        }
      } catch {
        setChatValidationMsg(t("auth.connectionError"));
      } finally {
        setValidatingChat(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [chatId, isManualInput, jwtToken, t, API_URL]);

  const handleAddRuleSpecificText = () => {
    if (!newSpecificText.trim()) return;
    setRuleSpecificTexts((prev) => [...prev, newSpecificText.trim()]);
    setNewSpecificText("");
  };

  const handleRemoveRuleSpecificText = (idx: number) => {
    setRuleSpecificTexts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateOrUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRuleId) {
      if (!chatId.trim()) return;
    } else {
      if (selectedChats.length === 0) {
        alert(t("spam.noChatsSelected"));
        return;
      }
    }

    setSavingRule(true);

    let finalSendHours = "9,13,17,21";
    let finalIntervalDays = 1;
    let finalFreqType = "hours";

    if (frequencyType === "four_times") {
      finalSendHours = sendHoursInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .join(",");
      finalFreqType = "hours";
    } else if (frequencyType === "three_times") {
      finalSendHours = sendHoursInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .join(",");
      finalFreqType = "hours";
    } else if (frequencyType === "twice") {
      finalSendHours = sendHoursInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .join(",");
      finalFreqType = "hours";
    } else if (frequencyType === "once") {
      finalSendHours = String(specificHour);
      finalFreqType = "hours";
    } else if (frequencyType === "custom_days") {
      finalSendHours = String(specificHour);
      finalIntervalDays = intervalDays;
      finalFreqType = "days";
    }

    try {
      let url = `${API_URL}/chats/rules`;
      let method = "POST";
      let payload: Record<string, unknown> = {};

      if (editingRuleId) {
        let finalChatId = chatId.trim();
        if (!finalChatId.startsWith("1:")) {
          finalChatId = `1:${finalChatId}`;
        }
        url = `${API_URL}/chats/rules/${editingRuleId}`;
        method = "PUT";
        payload = {
          chat_id: finalChatId,
          client_name: clientName || null,
          frequency_type: finalFreqType,
          interval_days: finalIntervalDays,
          send_hours: finalSendHours,
          spam_endlessly: !spamNotEndlessly,
          is_active: ruleActive,
          template_ids: selectedGlobalTplIds,
          specific_templates: ruleSpecificTexts,
        };
      } else {
        url = `${API_URL}/chats/rules/bulk`;
        method = "POST";
        payload = {
          chats: selectedChats.map((c) => ({
            chat_id: c.chatID,
            client_name: c.clientName || null,
          })),
          frequency_type: finalFreqType,
          interval_days: finalIntervalDays,
          send_hours: finalSendHours,
          spam_endlessly: !spamNotEndlessly,
          is_active: ruleActive,
          template_ids: selectedGlobalTplIds,
          specific_templates: ruleSpecificTexts,
        };
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowRuleForm(false);
        setEditingRuleId(null);
        setChatId("");
        setClientName("");
        setSelectedChats([]);
        setSendHoursInput("9,13,17,21");
        setSpamNotEndlessly(true);
        setRuleActive(true);
        setSelectedGlobalTplIds([]);
        setRuleSpecificTexts([]);
        await loadRules();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Error saving spam rule");
      }
    } catch {
      alert(t("auth.connectionError"));
    } finally {
      setSavingRule(false);
    }
  };

  const startEditRule = (rule: SpamRule) => {
    setEditingRuleId(rule.id);
    setChatId(rule.chat_id);
    setClientName(rule.client_name || "");
    setSpamNotEndlessly(!rule.spam_endlessly);
    setRuleActive(rule.is_active);
    setIsManualInput(false);

    if (rule.frequency_type === "days") {
      setFrequencyType("custom_days");
      setIntervalDays(rule.interval_days || 1);
      const hour = parseInt(rule.send_hours.split(",")[0]);
      setSpecificHour(isNaN(hour) ? 9 : hour);
    } else {
      const hours = rule.send_hours.split(",").map((h) => h.trim());
      if (hours.length === 4) {
        setFrequencyType("four_times");
        setSendHoursInput(rule.send_hours);
      } else if (hours.length === 3) {
        setFrequencyType("three_times");
        setSendHoursInput(rule.send_hours);
      } else if (hours.length === 2) {
        setFrequencyType("twice");
        setSendHoursInput(rule.send_hours);
      } else {
        setFrequencyType("once");
        const hour = parseInt(hours[0]);
        setSpecificHour(isNaN(hour) ? 9 : hour);
      }
    }

    const globals = rule.templates.filter((t) => t.is_global).map((t) => t.id);
    setSelectedGlobalTplIds(globals);

    const specifics = rule.templates
      .filter((t) => !t.is_global)
      .map((t) => t.text);
    setRuleSpecificTexts(specifics);

    setShowRuleForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRuleActive = async (rule: SpamRule) => {
    try {
      const res = await fetch(`${API_URL}/chats/rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          is_active: !rule.is_active,
        }),
      });
      if (res.ok) {
        await loadRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm(t("common.delete") + "?")) return;
    try {
      const res = await fetch(`${API_URL}/chats/rules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        await loadRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleGlobalTemplateSelection = (id: number) => {
    setSelectedGlobalTplIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredAndSortedRules = [...rules]
    .filter((rule) => {
      if (statusFilter === "active") return rule.is_active !== false;
      if (statusFilter === "inactive") return rule.is_active === false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "new") {
        return b.id - a.id;
      }
      if (sortBy === "old") {
        return a.id - b.id;
      }
      // sortBy === "last_sent"
      if (a.last_sent_at && b.last_sent_at) {
        return new Date(b.last_sent_at).getTime() - new Date(a.last_sent_at).getTime();
      }
      if (a.last_sent_at) return -1;
      if (b.last_sent_at) return 1;
      return b.id - a.id;
    });

  return (
    <SubscriptionGuard>
      <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("spam.rulesTab")}
          </h1>
          <Button
            onClick={() => {
              if (showRuleForm) {
                setShowRuleForm(false);
                setEditingRuleId(null);
                setSelectedChats([]);
              } else {
                setEditingRuleId(null);
                setChatId("");
                setClientName("");
                setSelectedChats([]);
                setIsManualInput(false);
                setChatValidationMsg("");
                setSpamNotEndlessly(true);
                setRuleActive(true);
                setSendHoursInput("9,13,17,21");
                setSelectedGlobalTplIds([]);
                setRuleSpecificTexts([]);
                setShowRuleForm(true);
                loadRecentChats();
              }
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} />
            {showRuleForm ? t("common.cancel") : t("spam.createRule")}
          </Button>
        </div>

        {/* Create/Edit Rule Form */}
        {showRuleForm && (
          <Card className="mb-8 border border-slate-200 shadow-lg rounded-2xl bg-white overflow-hidden animate-fade-in">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
              <CardTitle className="text-lg font-bold text-purple-700">
                {editingRuleId ? t("spam.editRule") : t("spam.createRule")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateOrUpdateRule} className="space-y-6">
                {/* Chat Selector */}
                <div>
                  {editingRuleId ? (
                    /* Editing mode: Single chat display */
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t("spam.chatId")}
                      </label>
                      <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                            <Check className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-snug">
                              {clientName || t("spam.buyer")}
                            </p>
                            <p className="text-xs font-mono font-semibold text-slate-400 mt-1">
                              {chatId.replace(/^1:/, "")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Creation mode: Bulk selection enabled */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {t("spam.chatId")}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualInput(!isManualInput);
                            setChatId("");
                            setClientName("");
                            setChatValidationMsg("");
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 font-bold hover:underline cursor-pointer"
                        >
                          {isManualInput
                            ? t("spam.chooseFromRecentChats")
                            : t("spam.enterIdManually")}
                        </button>
                      </div>

                      {isManualInput ? (
                        /* Manual input view */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                          <div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={chatId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setChatId(val);
                                  if (!val.trim()) {
                                    setClientName("");
                                    setChatValidationMsg("");
                                  }
                                }}
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                              />
                              <Button
                                type="button"
                                disabled={!chatId.trim() || validatingChat}
                                onClick={() => {
                                  let normalized = chatId.trim();
                                  if (!normalized.startsWith("1:")) {
                                    normalized = `1:${normalized}`;
                                  }
                                  if (
                                    !selectedChats.some(
                                      (c) => c.chatID === normalized,
                                    )
                                  ) {
                                    setSelectedChats((prev) => [
                                      ...prev,
                                      {
                                        chatID: normalized,
                                        clientName: clientName || "Покупатель",
                                      },
                                    ]);
                                  }
                                  setChatId("");
                                  setClientName("");
                                  setChatValidationMsg("");
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                              >
                                {t("spam.addToList")}
                              </Button>
                            </div>
                            {validatingChat && (
                              <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                <Loader2
                                  size={12}
                                  className="animate-spin text-purple-600"
                                />
                                <span>{t("spam.checkingChat")}</span>
                              </div>
                            )}
                            {chatValidationMsg && !validatingChat && (
                              <p
                                className={`text-xs mt-1.5 font-bold ${clientName ? "text-green-600" : "text-amber-600"}`}
                              >
                                {chatValidationMsg}
                              </p>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={clientName}
                              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-sm font-semibold cursor-not-allowed"
                              placeholder={t("spam.clientName")}
                              readOnly
                            />
                          </div>
                        </div>
                      ) : (
                        /* Selector List */
                        <div className="space-y-3">
                          {recentChats.length > 0 && (
                            <div className="flex justify-end mb-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedChats((prev) => {
                                    const next = [...prev];
                                    recentChats.forEach((rc) => {
                                      if (
                                        !next.some(
                                          (c) => c.chatID === rc.chatID,
                                        )
                                      ) {
                                        next.push({
                                          chatID: rc.chatID,
                                          clientName: rc.clientName,
                                        });
                                      }
                                    });
                                    return next;
                                  });
                                }}
                                className="text-xs text-purple-600 hover:text-purple-700 font-bold hover:underline cursor-pointer"
                              >
                                {t("spam.selectAll")}
                              </button>
                            </div>
                          )}

                          {loadingRecentChats ? (
                            <div className="flex justify-center items-center py-8 bg-slate-50 border border-slate-100 rounded-2xl">
                              <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
                              <span className="text-xs text-slate-400 ml-2">
                                {t("spam.loadingRecentChats")}
                              </span>
                            </div>
                          ) : recentChatsError ? (
                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl">
                              {recentChatsError}
                            </div>
                          ) : recentChats.length === 0 ? (
                            <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-medium">
                              {t("spam.noRecentChatsFound")}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 animate-fade-in">
                              {recentChats.map((chat) => {
                                const isSelected = selectedChats.some(
                                  (c) => c.chatID === chat.chatID,
                                );
                                return (
                                  <button
                                    key={chat.chatID}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedChats((prev) =>
                                          prev.filter(
                                            (c) => c.chatID !== chat.chatID,
                                          ),
                                        );
                                      } else {
                                        setSelectedChats((prev) => [
                                          ...prev,
                                          {
                                            chatID: chat.chatID,
                                            clientName: chat.clientName,
                                          },
                                        ]);
                                      }
                                    }}
                                    className={`text-left p-3 rounded-xl transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer ${
                                      isSelected
                                        ? "bg-purple-50/50 border-purple-400 border-2"
                                        : "bg-white border-slate-200 border hover:border-purple-300 hover:bg-purple-50/10"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="font-bold text-slate-800 text-xs truncate max-w-[125px] flex items-center gap-1">
                                        {isSelected && (
                                          <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                        )}
                                        {chat.clientName}
                                      </span>
                                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded shrink-0 ml-2">
                                        {chat.chatID.replace(/^1:/, "")}
                                      </span>
                                    </div>
                                    {chat.lastMessageText && (
                                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 italic">
                                        &ldquo;{chat.lastMessageText}&rdquo;
                                      </p>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selected Chats List Summary */}
                      {selectedChats.length > 0 && (
                        <div className="space-y-2 mt-4 animate-fade-in">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {t("spam.selectedChats")} ({selectedChats.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedChats([])}
                              className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                            >
                              {t("spam.clearAll")}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
                            {selectedChats.map((chat) => (
                              <div
                                key={chat.chatID}
                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm animate-fade-in"
                              >
                                <span className="text-xs font-bold text-slate-800">
                                  {chat.clientName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono font-semibold">
                                  ({chat.chatID.replace(/^1:/, "")})
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedChats((prev) =>
                                      prev.filter(
                                        (c) => c.chatID !== chat.chatID,
                                      ),
                                    )
                                  }
                                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5 text-xs font-bold"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Scheduling Parameters */}
                <div className="bg-slate-50/70 p-4 border border-slate-200/50 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <Calendar size={16} className="text-purple-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {t("spam.scheduleSettingsTitle")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {t("spam.frequency")}
                      </label>
                      <select
                        value={frequencyType}
                        onChange={(e) => {
                          const nextType = e.target.value as
                            | "four_times"
                            | "three_times"
                            | "twice"
                            | "once"
                            | "custom_days";
                          setFrequencyType(nextType);

                          if (nextType === "four_times") {
                            setSendHoursInput("9,13,17,21");
                          } else if (nextType === "three_times") {
                            setSendHoursInput("9,15,21");
                          } else if (nextType === "twice") {
                            setSendHoursInput("9,21");
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all cursor-pointer"
                      >
                        <option value="four_times">
                          {t("spam.fourTimesDaily")}
                        </option>
                        <option value="three_times">
                          {t("spam.threeTimesDaily")}
                        </option>
                        <option value="twice">{t("spam.twiceDaily")}</option>
                        <option value="once">{t("spam.onceDaily")}</option>
                        <option value="custom_days">
                          {t("spam.everyNDays")}
                        </option>
                      </select>
                    </div>

                    {/* Conditional Scheduling inputs */}
                    {frequencyType === "custom_days" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            {t("spam.intervalDays")}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={intervalDays}
                            onChange={(e) =>
                              setIntervalDays(
                                Math.max(1, parseInt(e.target.value) || 1),
                              )
                            }
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            {t("spam.specificHourLabel")}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={23}
                            value={specificHour}
                            onChange={(e) =>
                              setSpecificHour(
                                Math.min(
                                  23,
                                  Math.max(0, parseInt(e.target.value) || 0),
                                ),
                              )
                            }
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          />
                        </div>
                      </div>
                    ) : frequencyType === "once" ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          {t("spam.specificHourLabel")}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={specificHour}
                          onChange={(e) =>
                            setSpecificHour(
                              Math.min(
                                23,
                                Math.max(0, parseInt(e.target.value) || 0),
                              ),
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          {t("spam.sendHoursLabel")}
                        </label>
                        <input
                          type="text"
                          value={sendHoursInput}
                          onChange={(e) => setSendHoursInput(e.target.value)}
                          placeholder="9,13,17,21"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Trigger Descriptions / Trigger Help */}
                  <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex gap-3 items-start text-xs text-purple-950">
                    <Info
                      size={16}
                      className="text-purple-600 mt-0.5 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <p className="font-bold">
                        {t("spam.triggersInstructionsTitle")}
                      </p>
                      <ul className="list-disc space-y-1">
                        <li>{t("spam.timeRange")}</li>
                        <li>{t("spam.triggerInstructionOnce")}</li>
                        <li>{t("spam.triggerInstructionEndless")}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                    <input
                      type="checkbox"
                      checked={spamNotEndlessly}
                      onChange={(e) => setSpamNotEndlessly(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>{t("spam.spamEndlessly")}</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                    <input
                      type="checkbox"
                      checked={ruleActive}
                      onChange={(e) => setRuleActive(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span className="font-semibold text-purple-700">
                      {t("spam.active")}
                    </span>
                  </label>
                </div>

                {/* Template Associations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  {/* Global Templates */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t("spam.globalTemplates")}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedGlobalTplIds(
                            globalTemplates.map((tpl) => tpl.id),
                          )
                        }
                        disabled={
                          globalTemplates.length === 0 ||
                          selectedGlobalTplIds.length === globalTemplates.length
                        }
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {t("spam.selectAll")}
                      </button>
                    </div>
                    {loadingTemplates ? (
                      <div className="flex py-6 justify-center">
                        <Loader2
                          size={20}
                          className="animate-spin text-purple-600"
                        />
                      </div>
                    ) : globalTemplates.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center border-2 border-dashed border-slate-100 rounded-xl">
                        {t("spam.noTemplatesCreated")}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200/70 p-3 rounded-xl bg-slate-50/30">
                        {globalTemplates.map((tpl) => (
                          <label
                            key={tpl.id}
                            className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer hover:bg-slate-200/50 p-2 rounded-lg transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGlobalTplIds.includes(tpl.id)}
                              onChange={() =>
                                toggleGlobalTemplateSelection(tpl.id)
                              }
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5 h-4 w-4 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">
                                {tpl.text}
                              </span>
                              {tpl.start_hour !== null && (
                                <span className="text-[10px] text-purple-600 font-semibold mt-1 inline-flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>
                                    {tpl.start_hour}:00 - {tpl.end_hour}:00
                                    (MCK)
                                  </span>
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Specific Templates Creator */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {t("spam.specificTemplates")}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newSpecificText}
                          onChange={(e) => setNewSpecificText(e.target.value)}
                          placeholder={t("spam.templateTextPlaceholder")}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 outline-none text-slate-800 text-xs font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddRuleSpecificText}
                          className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span className="hidden sm:inline">
                            {t("spam.add")}
                          </span>
                        </button>
                      </div>
                      <div className="max-h-36 overflow-y-auto border border-slate-200/70 p-3 rounded-xl bg-slate-50/30 space-y-1.5">
                        {ruleSpecificTexts.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            {t("spam.noSpecificTemplates")}
                          </p>
                        ) : (
                          ruleSpecificTexts.map((text, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-xs"
                            >
                              <span className="font-bold text-slate-700 truncate mr-2 leading-tight">
                                {text}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveRuleSpecificText(idx)
                                }
                                className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowRuleForm(false);
                      setEditingRuleId(null);
                    }}
                    disabled={savingRule}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {t("common.cancel")}
                  </Button>
                   <Button
                    type="submit"
                    disabled={
                      savingRule ||
                      (editingRuleId
                        ? !chatId.trim() || (isManualInput && (validatingChat || !clientName))
                        : selectedChats.length === 0)
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {savingRule ? "..." : t("spam.saveRule")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Total stats label */}
        <div className="flex justify-between items-center mb-6 bg-slate-100 px-5 py-3.5 rounded-xl border border-slate-200/70 shadow-sm animate-fade-in">
          <span className="text-sm font-semibold text-slate-700">
            {t("spam.totalSpamRules")}
            <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg ml-1 shadow-sm">
              {rules.length}
            </span>
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{t("spam.periodicChatCampaignsTitle")}</span>
          </span>
        </div>

        {/* Filters and Sorting Controls */}
        {rules.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shadow-sm mb-6 animate-fade-in">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("spam.status")}:
              </span>
              <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/50">
                {(["all", "active", "inactive"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      statusFilter === filter
                        ? "bg-white text-purple-700 shadow-sm font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {filter === "all"
                      ? t("spam.filterAll")
                      : filter === "active"
                        ? t("spam.filterActive")
                        : t("spam.filterInactive")}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                {t("spam.sortBy")}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "last_sent" | "new" | "old")}
                className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/25 cursor-pointer text-slate-700 w-full sm:w-auto"
              >
                <option value="last_sent">{t("spam.sortLastSent")}</option>
                <option value="new">{t("spam.sortNew")}</option>
                <option value="old">{t("spam.sortOld")}</option>
              </select>
            </div>
          </div>
        )}

        {/* Rules List */}
        {loadingRules ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="animate-spin text-purple-600" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
            <span className="text-4xl block mb-2">📋</span>
            <span className="text-sm font-semibold">
              {t("spam.noRulesCreated")}
            </span>
          </div>
        ) : filteredAndSortedRules.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-3xl block mb-2">🔍</span>
            <span className="text-sm font-semibold text-slate-600">
              {t("spam.noRulesMatchFilters")}
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedRules.map((rule) => {
              return (
                <Card
                  key={rule.id}
                  className={`border transition-all duration-300 rounded-xl overflow-hidden ${
                    rule.is_active === false
                      ? "border-slate-200 bg-slate-50/50 opacity-75 hover:opacity-90"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex flex-row items-start flex-1 gap-4">
                      {/* Left icon wrapper */}
                      <div className="hidden sm:flex flex-col items-center justify-center bg-slate-50 border border-slate-200/60 p-3 rounded-xl min-w-[64px] select-none text-slate-400">
                        <MessageSquare size={24} className="text-purple-600" />
                        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          CHAT
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            title={rule.chat_id}
                            className="font-mono text-sm font-black text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm hover:bg-purple-50/50 hover:border-purple-200 transition-colors"
                          >
                            <a
                              href={`https://seller.wildberries.ru/chat-with-clients?chatId=${rule.chat_id.replace(/^1:/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 hover:underline transition-colors block"
                            >
                              {rule.chat_id.replace(/^1:/, "").length > 18
                                ? `${rule.chat_id.replace(/^1:/, "").slice(0, 10)}...${rule.chat_id.replace(/^1:/, "").slice(-5)}`
                                : rule.chat_id.replace(/^1:/, "")}
                            </a>
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-sm font-bold rounded-lg border ${
                              rule.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                          >
                            {rule.is_active
                              ? t("common.active")
                              : t("spam.pausedRules")}
                          </span>
                        </div>

                        <div className="text-base text-slate-700 font-semibold flex items-center gap-1.5">
                          <span>{t("spam.clientName")}:</span>
                          <span className="text-purple-700 font-extrabold">
                            {rule.client_name || t("spam.buyer")}
                          </span>
                        </div>

                        <div className="text-sm text-slate-500 font-medium">
                          {t("spam.frequency")}:{" "}
                          <span className="font-bold text-slate-700">
                            {rule.frequency_type === "days"
                              ? `${t("spam.every")} ${rule.interval_days} ${t("spam.daysShort")} ${t("spam.atHour")} ${rule.send_hours}:00`
                              : `${rule.send_hours.split(",").length} ${t("spam.timesDaily")}`}
                          </span>
                        </div>

                        {rule.last_sent_at && (
                          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                            <Clock size={12} />
                            <span>
                              {t("spam.lastSentAt")}{" "}
                              {formatDateTime(rule.last_sent_at)}
                            </span>
                          </div>
                        )}

                        {/* Associated templates preview */}
                        <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            {t("spam.linkedTemplates")}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {rule.templates.slice(0, 2).map((tpl) => (
                              <span
                                key={tpl.id}
                                className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                                  tpl.is_global
                                    ? "bg-purple-50 text-purple-700 border-purple-100"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                                title={tpl.text}
                              >
                                {tpl.text.slice(0, 30)}
                                {tpl.text.length > 30 ? "..." : ""}
                              </span>
                            ))}
                            {rule.templates.length > 2 && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-md border bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/85 transition-colors cursor-help"
                                title={rule.templates.slice(2).map((tpl) => tpl.text).join("\n")}
                              >
                                + {rule.templates.length - 2}
                              </span>
                            )}
                            {rule.templates.length === 0 && (
                              <span className="text-xs text-slate-400 italic">
                                {t("spam.noLinkedTemplates")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions and toggle on right side */}
                    <div className="sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 flex flex-row sm:flex-col gap-2 min-w-[150px] items-center sm:items-stretch">
                      <div className="flex items-center justify-between gap-2 px-1 mb-1 w-full sm:w-auto select-none">
                        <span
                          className={`text-xs font-bold ${rule.is_active ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {rule.is_active
                            ? t("rules.active")
                            : t("rules.inactive")}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRuleActive(rule)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            rule.is_active ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              rule.is_active ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          startEditRule(rule);
                          loadRecentChats();
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 text-xs cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                        <span className="hidden sm:inline">
                          {t("rules.edit")}
                        </span>
                      </button>

                      <button
                        onClick={() => fetchRuleHistory(rule.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 text-xs cursor-pointer"
                        title="View sent log"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">
                          {t("spam.log")}
                        </span>
                      </button>

                      <Button
                        variant="danger"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 text-xs cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">
                          {t("common.delete")}
                        </span>
                      </Button>
                    </div>
                  </CardContent>

                  {/* Expandable Sent history per rule */}
                  {sentHistory[rule.id] !== undefined && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-4 bg-slate-50/30 animate-fade-in">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{t("spam.sentHistoryTitle")}</span>
                        </h4>
                        <button
                          onClick={() => {
                            setSentHistory((prev) => {
                              const updated = { ...prev };
                              delete updated[rule.id];
                              return updated;
                            });
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 font-bold hover:underline"
                        >
                          {t("spam.hideLog")}
                        </button>
                      </div>
                      {sentHistory[rule.id].length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 bg-white rounded-xl">
                          {t("spam.noMessagesSentForRule")}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sentHistory[rule.id].map((h) => (
                            <div
                              key={h.id}
                              className="flex justify-between items-center text-sm bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm"
                            >
                              <span className="font-semibold text-slate-700">
                                {h.text}
                              </span>
                              <span className="text-xs text-slate-400 font-bold shrink-0 ml-4">
                                {formatDateTime(h.sent_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SubscriptionGuard>
  );
}
