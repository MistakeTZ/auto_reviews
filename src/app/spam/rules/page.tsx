"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Play, Pause, Loader2, Edit2, Eye, Check } from "lucide-react";
import { SpamRule, SpamTemplate, SpamSentMessage } from "../types";

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
  const [frequencyType, setFrequencyType] = useState<
    "four_times" | "three_times" | "twice" | "once" | "custom_days"
  >("four_times");
  const [intervalDays, setIntervalDays] = useState(1);
  const [specificHour, setSpecificHour] = useState(9);
  const [spamEndlessly, setSpamEndlessly] = useState(false);
  const [ruleActive, setRuleActive] = useState(true);
  const [selectedGlobalTplIds, setSelectedGlobalTplIds] = useState<number[]>(
    [],
  );
  const [ruleSpecificTexts, setRuleSpecificTexts] = useState<string[]>([]);
  const [newSpecificText, setNewSpecificText] = useState("");
  const [savingRule, setSavingRule] = useState(false);

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
        setSpamEndlessly(false);
        setRuleActive(true);
        setSelectedGlobalTplIds([]);
        setRuleSpecificTexts([]);
        await loadRules();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Error saving spam rule");
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

    const globals = rule.templates.filter((t) => t.is_global).map((t) => t.id);
    setSelectedGlobalTplIds(globals);

    const specifics = rule.templates
      .filter((t) => !t.is_global)
      .map((t) => t.text);
    setRuleSpecificTexts(specifics);

    setShowRuleForm(true);
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

  return (
    <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("spam.rulesTab")}
        </h1>
        {!showRuleForm && (
          <Button
            onClick={() => {
              setEditingRuleId(null);
              setChatId("");
              setClientName("");
              setSpamEndlessly(false);
              setRuleActive(true);
              setSelectedGlobalTplIds([]);
              setRuleSpecificTexts([]);
              setShowRuleForm(true);
              loadRecentChats();
            }}
            className="flex items-center gap-2"
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
              {/* Chat Selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  {t("spam.chatId")}
                </label>

                {chatId ? (
                  /* Selected Chat Card */
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-sm animate-fade-in">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-snug">
                          {clientName || "Buyer"}
                        </p>
                        <p className="text-xs font-mono font-semibold text-slate-400 mt-1">
                          {chatId}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setChatId("");
                        setClientName("");
                      }}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                ) : (
                  /* Selector List */
                  <div className="space-y-3">
                    {loadingRecentChats ? (
                      <div className="flex justify-center items-center py-6 bg-white border border-slate-100 rounded-2xl">
                        <Loader2 className="animate-spin text-indigo-600 h-6 w-6" />
                        <span className="text-xs text-slate-400 ml-2">Loading active chats...</span>
                      </div>
                    ) : recentChatsError ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl">
                        {recentChatsError}
                      </div>
                    ) : recentChats.length === 0 ? (
                      <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs font-medium">
                        No active chats found on Wildberries.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                        {recentChats.map((chat) => (
                          <button
                            key={chat.chatID}
                            type="button"
                            onClick={() => {
                              setChatId(chat.chatID);
                              setClientName(chat.clientName);
                            }}
                            className="text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-800 text-sm truncate max-w-[120px]">
                                {chat.clientName}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded shrink-0 ml-2">
                                {chat.chatID.replace(/^1:/, "")}
                              </span>
                            </div>
                            {chat.lastMessageText && (
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 italic">
                                &ldquo;{chat.lastMessageText}&rdquo;
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {t("spam.frequency")}
                  </label>
                  <select
                    value={frequencyType}
                    onChange={(e) =>
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
                    <option value="custom_days">{t("spam.everyNDays")}</option>
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
                      value={
                        frequencyType === "four_times"
                          ? "9,13,17,21"
                          : frequencyType === "three_times"
                            ? "9,15,21"
                            : frequencyType === "twice"
                              ? "9,21"
                              : ""
                      }
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
                  {loadingTemplates ? (
                    <div className="flex py-4 justify-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-slate-400"
                      />
                    </div>
                  ) : globalTemplates.length === 0 ? (
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
                                {tpl.start_hour}:00 - {tpl.end_hour}:00 (MSK)
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
                              onClick={() => handleRemoveRuleSpecificText(idx)}
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
                <Button type="submit" disabled={savingRule || !chatId}>
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
                        onClick={() => {
                          startEditRule(rule);
                          loadRecentChats();
                        }}
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
  );
}
