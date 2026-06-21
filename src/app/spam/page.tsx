"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Megaphone,
  Settings as SettingsIcon,
  CreditCard,
  Plus,
  Trash2,
  Play,
  Pause,
  Loader2,
  CheckCircle,
  Edit2,
  LayoutDashboard,
  Eye,
  EyeOff,
} from "lucide-react";

interface SpamTemplate {
  id: number;
  text: string;
  start_hour: number | null;
  end_hour: number | null;
  is_global: boolean;
  rule_id: number | null;
}

interface SpamRule {
  id: number;
  chat_id: string;
  client_name: string | null;
  frequency_type: string;
  interval_days: number | null;
  send_hours: string;
  spam_endlessly: boolean;
  is_active: boolean;
  last_sent_at: string | null;
  templates: SpamTemplate[];
}

interface SpamSentMessage {
  id: number;
  rule_id: number;
  text: string;
  sent_at: string;
  chat_id: string;
  add_time: number | null;
}

interface SpamStats {
  total_rules: number;
  active_rules: number;
  total_sent: number;
  sent_last_24h: number;
}

export default function SpamPage() {
  const {
    jwtToken,
    hasWbChatApiToken,
    notifyAnswersInChats,
    notifyAllMessages,
    fetchMe,
  } = useAppStore();
  const { t } = useTranslation();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "rules" | "settings" | "tariffs"
  >("dashboard");

  // State
  const [stats, setStats] = useState<SpamStats>({
    total_rules: 0,
    active_rules: 0,
    total_sent: 0,
    sent_last_24h: 0,
  });
  const [lastSent, setLastSent] = useState<SpamSentMessage[]>([]);
  const [rules, setRules] = useState<SpamRule[]>([]);
  const [globalTemplates, setGlobalTemplates] = useState<SpamTemplate[]>([]);
  const [sentHistory, setSentHistory] = useState<
    Record<number, SpamSentMessage[]>
  >({});

  // Loading indicators
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Settings State
  const [chatTokenInput, setChatTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [notifyAnswers, setNotifyAnswers] = useState(true);
  const [notifyAll, setNotifyAll] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Global Template Creator State
  const [newTplText, setNewTplText] = useState("");
  const [newTplStart, setNewTplStart] = useState<number | "">("");
  const [newTplEnd, setNewTplEnd] = useState<number | "">("");
  const [addingTemplate, setAddingTemplate] = useState(false);

  // Rule Creator/Editor State
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [chatId, setChatId] = useState("");
  const [clientName, setClientName] = useState("");
  const [validatingChat, setValidatingChat] = useState(false);
  const [chatValidationMsg, setChatValidationMsg] = useState("");
  const [frequencyType, setFrequencyType] = useState<
    "four_times" | "three_times" | "twice" | "once" | "custom_days"
  >("four_times");
  const [intervalDays, setIntervalDays] = useState(1);
  const [customSendHours, setCustomSendHours] = useState("9,13,17,21");
  const [specificHour, setSpecificHour] = useState(9);
  const [spamEndlessly, setSpamEndlessly] = useState(false);
  const [ruleActive, setRuleActive] = useState(true);
  const [selectedGlobalTplIds, setSelectedGlobalTplIds] = useState<number[]>(
    [],
  );
  const [ruleSpecificTexts, setRuleSpecificTexts] = useState<string[]>([]);
  const [newSpecificText, setNewSpecificText] = useState("");
  const [savingRule, setSavingRule] = useState(false);

  // Fetch functions
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
      fetchMe();
      setTimeout(() => {
        setNotifyAnswers(notifyAnswersInChats);
        setNotifyAll(notifyAllMessages);
        loadDashboardData();
        loadRules();
        loadTemplates();
      }, 0);
    }
  }, [
    jwtToken,
    notifyAnswersInChats,
    notifyAllMessages,
    fetchMe,
    loadDashboardData,
    loadRules,
    loadTemplates,
  ]);

  // Chat ID Dynamic Validation
  useEffect(() => {
    if (!chatId.trim()) {
      setTimeout(() => {
        setClientName("");
        setChatValidationMsg("");
      }, 0);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setValidatingChat(true);
      setChatValidationMsg(t("spam.checkingChat"));
      try {
        const res = await fetch(
          `${API_URL}/chats/validate-id?chat_id=${encodeURIComponent(chatId.trim())}`,
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
        setChatValidationMsg("Connection error");
      } finally {
        setValidatingChat(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [chatId, jwtToken, t, API_URL]);

  // Actions
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
        await loadDashboardData();
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
        await loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    if (!chatId.trim()) return;

    setSavingRule(true);

    // Map frequency selection to DB values
    let finalSendHours = "9,13,17,21";
    let finalIntervalDays = 1;
    let finalFreqType = "hours";

    if (frequencyType === "four_times") {
      finalSendHours = "9,13,17,21";
      finalFreqType = "hours";
    } else if (frequencyType === "three_times") {
      finalSendHours = "9,15,21";
      finalFreqType = "hours";
    } else if (frequencyType === "twice") {
      finalSendHours = "9,21";
      finalFreqType = "hours";
    } else if (frequencyType === "once") {
      finalSendHours = String(specificHour);
      finalFreqType = "hours";
    } else if (frequencyType === "custom_days") {
      finalSendHours = String(specificHour);
      finalIntervalDays = intervalDays;
      finalFreqType = "days";
    }

    const payload = {
      chat_id: chatId.trim(),
      client_name: clientName || null,
      frequency_type: finalFreqType,
      interval_days: finalIntervalDays,
      send_hours: finalSendHours,
      spam_endlessly: spamEndlessly,
      is_active: ruleActive,
      template_ids: selectedGlobalTplIds,
      specific_templates: ruleSpecificTexts,
    };

    try {
      let url = `${API_URL}/chats/rules`;
      let method = "POST";
      if (editingRuleId) {
        url = `${API_URL}/chats/rules/${editingRuleId}`;
        method = "PUT";
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
        setSelectedGlobalTplIds([]);
        setRuleSpecificTexts([]);
        await loadRules();
        await loadDashboardData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Error saving rule");
      }
    } catch {
      alert("Connection error");
    } finally {
      setSavingRule(false);
    }
  };

  const startEditRule = (rule: SpamRule) => {
    setEditingRuleId(rule.id);
    setChatId(rule.chat_id);
    setClientName(rule.client_name || "");
    setSpamEndlessly(rule.spam_endlessly);
    setRuleActive(rule.is_active);

    // Map DB send_hours and interval back to UI selector
    if (rule.frequency_type === "days") {
      setFrequencyType("custom_days");
      setIntervalDays(rule.interval_days || 1);
      const hour = parseInt(rule.send_hours.split(",")[0]);
      setSpecificHour(isNaN(hour) ? 9 : hour);
    } else {
      const hours = rule.send_hours.split(",").map((h) => h.trim());
      if (hours.length === 4) {
        setFrequencyType("four_times");
      } else if (hours.length === 3) {
        setFrequencyType("three_times");
      } else if (hours.length === 2) {
        setFrequencyType("twice");
      } else {
        setFrequencyType("once");
        const hour = parseInt(hours[0]);
        setSpecificHour(isNaN(hour) ? 9 : hour);
      }
    }

    // Load template selections
    const globals = rule.templates.filter((t) => t.is_global).map((t) => t.id);
    setSelectedGlobalTplIds(globals);

    const specifics = rule.templates
      .filter((t) => !t.is_global)
      .map((t) => t.text);
    setRuleSpecificTexts(specifics);

    setShowRuleForm(true);
  };

  const toggleGlobalTemplateSelection = (id: number) => {
    setSelectedGlobalTplIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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

      {/* Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl max-w-md shrink-0 border border-slate-200/50">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "dashboard"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard size={16} />
          <span>{t("spam.dashboardTab")}</span>
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "rules"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Megaphone size={16} />
          <span>{t("spam.rulesTab")}</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "settings"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <SettingsIcon size={16} />
          <span>{t("spam.settingsTab")}</span>
        </button>
        <button
          onClick={() => setActiveTab("tariffs")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "tariffs"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CreditCard size={16} />
          <span>{t("spam.referralsTab")}</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Card className="hover:scale-[1.01] transition-transform duration-200">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <SettingsIcon size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {t("spam.chatToken")}
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-2 truncate">
                    {hasWbChatApiToken ? "✓ Configured" : "✗ Not set"}
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
                        <th className="px-6 py-3">{t("spam.chatId")}</th>
                        <th className="px-6 py-3">{t("spam.text")}</th>
                        <th className="px-6 py-3">{t("spam.date")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lastSent.map((msg) => (
                        <tr key={msg.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono text-xs">
                            {msg.chat_id}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {msg.text}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
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
      )}

      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
              {t("spam.rulesTab")}
            </h2>
            {!showRuleForm && (
              <Button
                onClick={() => {
                  setEditingRuleId(null);
                  setChatId("");
                  setClientName("");
                  setSelectedGlobalTplIds([]);
                  setRuleSpecificTexts([]);
                  setShowRuleForm(true);
                }}
                className="flex items-center space-x-1.5"
              >
                <Plus size={16} />
                <span>{t("spam.createRule")}</span>
              </Button>
            )}
          </div>

          {/* Create/Edit Rule Form Overlay */}
          {showRuleForm && (
            <Card className="border-indigo-100 bg-indigo-50/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {editingRuleId ? t("spam.editRule") : t("spam.createRule")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrUpdateRule} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Chat ID */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        {t("spam.chatId")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={chatId}
                          onChange={(e) => setChatId(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          required
                        />
                        {validatingChat && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2
                              size={16}
                              className="animate-spin text-slate-400"
                            />
                          </div>
                        )}
                      </div>
                      {chatValidationMsg && (
                        <p
                          className={`text-xs mt-1 font-medium ${clientName ? "text-green-600" : "text-amber-600"}`}
                        >
                          {chatValidationMsg}
                        </p>
                      )}
                    </div>

                    {/* Client Name */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        {t("spam.clientName")}
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
                        placeholder="Fetched automatically"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        {t("spam.frequency")}
                      </label>
                      <select
                        value={frequencyType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setFrequencyType(
                            e.target.value as
                              | "four_times"
                              | "three_times"
                              | "twice"
                              | "once"
                              | "custom_days",
                          )
                        }
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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

                    {/* Conditional Scheduling */}
                    {frequencyType === "custom_days" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-semibold mb-1">
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
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">
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
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    ) : frequencyType === "once" ? (
                      <div>
                        <label className="block text-sm font-semibold mb-1">
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
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          {t("spam.sendHoursLabel")}
                        </label>
                        <input
                          type="text"
                          value={customSendHours}
                          onChange={(e) => setCustomSendHours(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500"
                          readOnly
                        />
                      </div>
                    )}
                  </div>

                  {/* Config Flags */}
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={spamEndlessly}
                        onChange={(e) => setSpamEndlessly(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {t("spam.spamEndlessly")}
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ruleActive}
                        onChange={(e) => setRuleActive(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {t("spam.active")}
                      </span>
                    </label>
                  </div>

                  {/* Templates Association */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                    {/* Global Template list */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">
                        {t("spam.globalTemplates")}
                      </h4>
                      {globalTemplates.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">
                          {t("spam.noTemplatesCreated")}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-white">
                          {globalTemplates.map((tpl) => (
                            <label
                              key={tpl.id}
                              className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer hover:bg-slate-50 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedGlobalTplIds.includes(tpl.id)}
                                onChange={() =>
                                  toggleGlobalTemplateSelection(tpl.id)
                                }
                                className="rounded text-purple-600 focus:ring-purple-500 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold block">
                                  {tpl.text}
                                </span>
                                {tpl.start_hour !== null && (
                                  <span className="text-[10px] text-indigo-500">
                                    {tpl.start_hour}:00 - {tpl.end_hour}:00
                                    (MSK)
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chat specific templates creator */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">
                        {t("spam.specificTemplates")}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newSpecificText}
                            onChange={(e) => setNewSpecificText(e.target.value)}
                            placeholder={t("spam.templateTextPlaceholder")}
                            className="flex-1 px-3 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                          <Button
                            type="button"
                            onClick={handleAddRuleSpecificText}
                            className="px-3 py-1 text-xs"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-white space-y-1">
                          {ruleSpecificTexts.length === 0 ? (
                            <p className="text-xs text-slate-400 py-1 text-center">
                              No specific templates added
                            </p>
                          ) : (
                            ruleSpecificTexts.map((text, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-slate-50 p-1.5 rounded text-xs"
                              >
                                <span className="font-medium truncate mr-2">
                                  {text}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveRuleSpecificText(idx)
                                  }
                                  className="text-rose-500 hover:text-rose-700"
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

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowRuleForm(false);
                        setEditingRuleId(null);
                      }}
                      disabled={savingRule}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingRule || validatingChat}
                    >
                      {savingRule ? "..." : t("spam.saveRule")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Rules List */}
          {loadingRules ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={36} className="animate-spin text-indigo-600" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {t("spam.noRulesCreated")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rules.map((rule) => {
                return (
                  <Card
                    key={rule.id}
                    className={`border-l-4 transition-shadow hover:shadow-md ${rule.is_active ? "border-l-green-500" : "border-l-slate-300"}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {rule.chat_id}
                            </h3>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${rule.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {rule.is_active
                                ? t("common.active")
                                : t("spam.pausedRules")}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mt-2">
                            {t("spam.clientName")}:{" "}
                            <span className="text-indigo-600">
                              {rule.client_name || "Buyer"}
                            </span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {t("spam.frequency")}:{" "}
                            <span className="font-semibold text-slate-600">
                              {rule.frequency_type === "days"
                                ? `${t("spam.everyNDays")} (${rule.interval_days} d) at ${rule.send_hours}:00`
                                : `${rule.send_hours.split(",").length}x daily (${t("spam.allowedHours")} ${rule.send_hours})`}
                            </span>
                          </p>
                          {rule.last_sent_at && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Last Sent:{" "}
                              {new Date(rule.last_sent_at).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => toggleRuleActive(rule)}
                            className={`p-2 rounded-xl border transition-all duration-200 ${
                              rule.is_active
                                ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                            }`}
                            title={rule.is_active ? "Pause" : "Start"}
                          >
                            {rule.is_active ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => startEditRule(rule)}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all duration-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => fetchRuleHistory(rule.id)}
                            className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-600 transition-all duration-200"
                            title="View sent log"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-600 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Sent history per rule */}
                      {sentHistory[rule.id] !== undefined && (
                        <div className="mt-4 border-t border-slate-100 pt-4 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Sent Messages History
                            </h4>
                            <button
                              onClick={() => {
                                setSentHistory((prev) => {
                                  const updated = { ...prev };
                                  delete updated[rule.id];
                                  return updated;
                                });
                              }}
                              className="text-xs text-indigo-600 hover:underline"
                            >
                              Hide
                            </button>
                          </div>
                          {sentHistory[rule.id].length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">
                              No history found for this rule
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {sentHistory[rule.id].map((h) => (
                                <div
                                  key={h.id}
                                  className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded"
                                >
                                  <span className="font-semibold text-slate-700">
                                    {h.text}
                                  </span>
                                  <span className="text-slate-400 shrink-0 ml-4">
                                    {new Date(h.sent_at).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
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
                      <Loader2
                        size={24}
                        className="animate-spin text-indigo-600"
                      />
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
                  <form
                    onSubmit={handleAddGlobalTemplate}
                    className="space-y-4"
                  >
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
      )}

      {activeTab === "tariffs" && (
        <Card className="max-w-2xl mx-auto overflow-hidden border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20">
          <CardContent className="p-12 text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
              <CreditCard size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">
                {t("spam.referralsAndTariffs")}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {t("spam.comingSoon")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
