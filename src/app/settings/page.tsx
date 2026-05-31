"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  Bell,
  Bot,
  RefreshCw,
  ChevronDown,
  Globe,
  HelpCircle,
  Check,
  Lock,
  Copy,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FlagSwitcher from "@/components/ui/FlagSwitcher";
import { trackMetrikaGoal } from "@/lib/metrika";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
type QuestionAnswerMode = "none" | "manual" | "confirm" | "auto";
const DEFAULT_BOTS_CONFIG = {
  tg_bot: process.env.TG_BOT_NAME || "none",
  max_bot: process.env.MAX_BOT_NAME || "none",
};

export default function SettingsPage() {
  const apiToken = useAppStore((state) => state.apiToken);
  const setToken = useAppStore((state) => state.setToken);
  const notificationMethods = useAppStore((state) => state.notificationMethods);
  const fetchNotificationMethods = useAppStore(
    (state) => state.fetchNotificationMethods,
  );
  const addNotificationMethod = useAppStore(
    (state) => state.addNotificationMethod,
  );
  const deleteNotificationMethod = useAppStore(
    (state) => state.deleteNotificationMethod,
  );
  const userUuid = useAppStore((state) => state.userUuid);
  const fetchMe = useAppStore((state) => state.fetchMe);
  const jwtToken = useAppStore((state) => state.jwtToken);

  const { t, language, setLanguage } = useTranslation();
  const [tokenInput, setTokenInput] = useState(apiToken || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Notification states
  const [newMethodType, setNewMethodType] = useState<
    "telegram" | "email" | "max"
  >("telegram");
  const [newMethodValue, setNewMethodValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [botsConfig, setBotsConfig] = useState(DEFAULT_BOTS_CONFIG);
  const [questionAnswerMode, setQuestionAnswerMode] =
    useState<QuestionAnswerMode>("manual");
  const [questionAnswerPrompt, setQuestionAnswerPrompt] = useState("");
  const [isLoadingQuestionSettings, setIsLoadingQuestionSettings] =
    useState(false);
  const [isSavingQuestionSettings, setIsSavingQuestionSettings] =
    useState(false);
  const [questionSettingsError, setQuestionSettingsError] = useState<
    string | null
  >(null);
  const [questionSettingsSaved, setQuestionSettingsSaved] = useState(false);

  // Initial load
  useEffect(() => {
    fetchNotificationMethods();
    fetchMe();

    if (jwtToken) {
      setIsLoadingQuestionSettings(true);
      fetch(`${API_URL}/settings/question-answer-settings`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          const mode = String(
            data?.question_answer_mode || "manual",
          ).toLowerCase();
          if (
            mode === "none" ||
            mode === "manual" ||
            mode === "confirm" ||
            mode === "auto"
          ) {
            setQuestionAnswerMode(mode);
          } else {
            setQuestionAnswerMode("manual");
          }
          setQuestionAnswerPrompt(data?.question_answer_prompt || "");
          setQuestionSettingsError(null);
          setQuestionSettingsSaved(false);
        })
        .catch(() => {
          setQuestionSettingsError(
            t("settings.questionAnswerSettingsErrorFallback"),
          );
        })
        .finally(() => {
          setIsLoadingQuestionSettings(false);
        });
    }

    // Fetch bots configuration
    fetch(`${API_URL}/settings/bots-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.tg_bot || data.max_bot)) {
          setBotsConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Error loading bots config:", err));
  }, [fetchNotificationMethods, fetchMe, jwtToken, t]);

  // Live polling for instant bot connection verification
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationMethods();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchNotificationMethods]);

  const handleTokenChange = (val: string) => {
    setTokenInput(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSave = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const isFirstTokenConnect = !apiToken;
      await setToken(tokenInput);
      if (isFirstTokenConnect) {
        trackMetrikaGoal("inputToken", "inputToken");
      }
    } catch (e: any) {
      setErrorMsg(e.message || t("settings.tokenSaveErrorFallback"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotificationMethods();
    setIsRefreshing(false);
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMethodType !== "email" || !newMethodValue) return;

    if (notificationMethods.length >= 5) {
      alert(t("settings.methodsLimitAlert"));
      return;
    }

    await addNotificationMethod({
      type: "email",
      value: newMethodValue,
      isActive: true,
    });

    setNewMethodValue("");
  };

  const reachedLimit = notificationMethods.length >= 5;

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  const handleSaveQuestionSettings = async () => {
    if (!jwtToken) return;
    setIsSavingQuestionSettings(true);
    setQuestionSettingsError(null);
    setQuestionSettingsSaved(false);

    try {
      const res = await fetch(`${API_URL}/settings/question-answer-settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          question_answer_mode: questionAnswerMode,
          question_answer_prompt: questionAnswerPrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.detail ||
            data.message ||
            t("settings.questionAnswerSettingsErrorFallback"),
        );
      }

      setQuestionSettingsSaved(true);
      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setQuestionSettingsSaved(false);
      }, 4000);
    } catch (e: any) {
      setQuestionSettingsError(
        e?.message || t("settings.questionAnswerSettingsErrorFallback"),
      );
    } finally {
      setIsSavingQuestionSettings(false);
    }
  };

  const copyToClipboard = () => {
    const valueToCopy = tokenInput || apiToken || "";
    if (valueToCopy) {
      navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-24 px-4 pb-12 md:p-8 w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* 1. Interface Language Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 shadow-sm shadow-slate-200/40">
        <div className="space-y-4 text-center md:text-left z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {t("settings.interfaceLanguage")}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {t("settings.selectInterfaceLanguage")}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-700 font-bold text-sm shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <FlagSwitcher />
            <span>{language === "en" ? "English" : "Русский"}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>

        {/* Premium Globe Vector Art Background */}
        <div className="relative w-48 h-32 md:h-36 flex items-center justify-center mt-6 md:mt-0 select-none">
          <div className="absolute inset-0 bg-indigo-50 rounded-full blur-xl opacity-60 animate-pulse" />
          <svg
            className="w-24 h-24 text-indigo-500/80 animate-spin-slow z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              strokeLinecap="round"
              d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
            />
            <path d="M2 12h20M12 2v20" />
          </svg>
          {/* Orbital floating sparkles */}
          <div className="absolute top-2 left-6 text-indigo-400 text-lg animate-bounce duration-1000">
            ✦
          </div>
          <div className="absolute bottom-4 right-8 text-indigo-400 text-sm animate-pulse">
            ✦
          </div>
          <div className="absolute top-8 right-6 text-indigo-300 text-xs">
            ✦
          </div>
        </div>
      </div>

      {/* 2. Wildberries API Integration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 space-y-6 shadow-sm shadow-slate-200/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {t("settings.wbApiIntegration")}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {t("settings.connectApiForAutomation")}
            </p>
          </div>
          {apiToken ? (
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
                {t("settings.wbApiTokenCardTitle")}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {t("settings.wbApiTokenCardDesc")}
              </p>
            </div>

            {/* Guide Button linking to standalone instructions page */}
            <Link
              href="/settings/instructions"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-indigo-100 rounded-2xl text-xs font-extrabold text-indigo-700 hover:text-indigo-800 transition-all shadow-sm shrink-0 w-fit"
            >
              <span>{t("settings.instruction")}</span>
              <ExternalLink size={12} className="stroke-[2.5]" />
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("settings.apiToken")}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showToken ? "text" : "password"}
                  value={tokenInput || apiToken || ""}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  className="w-full pl-4 pr-24 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800 font-mono text-sm tracking-wide shadow-inner"
                  placeholder="••••••••••••••••••••••••••••••••••••••••"
                />
                <div className="absolute right-3 flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    title={showToken ? "Hide token" : "Show token"}
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all relative"
                    title="Copy token"
                    disabled={!tokenInput && !apiToken}
                  >
                    {copied ? (
                      <Check size={18} className="text-emerald-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">
                {t("settings.neverShareToken")}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex items-start gap-3 text-sm animate-shake">
                <AlertCircle
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-rose-600"
                />
                <div>
                  <p className="font-bold mb-1">{t("settings.tokenError")}</p>
                  <p className="text-xs font-semibold opacity-90">{errorMsg}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!tokenInput || isVerifying || tokenInput === apiToken}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-indigo-600/10 transition-all duration-200 active:scale-95 border border-indigo-600 ${
                !tokenInput || tokenInput === apiToken
                  ? "bg-indigo-300 border-indigo-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/25"
              }`}
            >
              <RefreshCw
                size={16}
                className={`shrink-0 ${isVerifying ? "animate-spin" : ""}`}
              />
              <span>
                {isVerifying
                  ? t("settings.verifying")
                  : !apiToken
                    ? t("settings.verifySave")
                    : t("settings.updateToken")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Answers to Questions Card ("Ответы на вопросы") */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 space-y-6 shadow-sm shadow-slate-200/40">
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {t("settings.qnaSettingsTitle")}
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            {t("settings.qnaSettingsDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Answer Mode (Left Column) */}
          <div className="space-y-2 md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("settings.questionAnswerModeLabel")}
            </label>
            <div className="relative">
              <select
                value={questionAnswerMode}
                onChange={(e) => {
                  setQuestionAnswerMode(e.target.value as QuestionAnswerMode);
                  setQuestionSettingsSaved(false);
                }}
                disabled={isLoadingQuestionSettings || isSavingQuestionSettings}
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none font-bold shadow-sm cursor-pointer"
              >
                <option value="none">
                  {t("settings.questionAnswerModeNoNotifications")}
                </option>
                <option value="manual">
                  {t("settings.questionAnswerModeManual")}
                </option>
                <option value="confirm">
                  {t("settings.questionAnswerModeConfirm")}
                </option>
                <option value="auto">
                  {t("settings.questionAnswerModeAuto")}
                </option>
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} className="stroke-[2.5]" />
              </div>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Prompt Box (Right Column) */}
          <div className="space-y-2 md:col-span-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("settings.questionAnswerPromptLabel")}
            </label>
            <textarea
              value={questionAnswerPrompt}
              onChange={(e) => {
                setQuestionAnswerPrompt(e.target.value);
                setQuestionSettingsSaved(false);
              }}
              rows={4}
              disabled={isLoadingQuestionSettings || isSavingQuestionSettings}
              placeholder={t("settings.questionAnswerPromptPlaceholder")}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>
        </div>

        {questionSettingsError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-semibold">
            {questionSettingsError}
          </div>
        )}

        {/* Footer Area with Success message and Save Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            {questionSettingsSaved && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100/60 text-emerald-800 text-sm font-extrabold shadow-sm w-full sm:w-auto animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{t("settings.settingsSavedSuccess")}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveQuestionSettings}
            disabled={isLoadingQuestionSettings || isSavingQuestionSettings}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/10 transition-all hover:shadow-xl active:scale-95"
          >
            <Check size={16} className="stroke-[2.5]" />
            <span>
              {isSavingQuestionSettings
                ? t("settings.questionAnswerSettingsSaving")
                : t("settings.questionAnswerSettingsSave")}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Notification Methods Card ("Способы уведомлений") */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 space-y-6 shadow-sm shadow-slate-200/40">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 mt-0.5">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {t("settings.notifMethods")}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {t("settings.notifMethodsDescMock")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
              {t("settings.maxMethodsLimit")}
            </span>
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
              title={t("settings.refreshBotList")}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Current Connected Methods List */}
        <div className="space-y-3.5">
          {notificationMethods &&
            notificationMethods.map((method) => {
              const isTelegram = method.type === "telegram";
              const isMax = method.type === "max";
              const isEmail = method.type === "email";

              return (
                <div
                  key={method.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50/80 transition-all gap-4 relative"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-3 rounded-2xl ${
                        isEmail
                          ? "bg-blue-50 text-blue-600"
                          : isTelegram
                            ? "bg-sky-50 text-sky-600"
                            : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {isEmail && <Mail size={20} className="stroke-[2]" />}
                      {isTelegram && (
                        <Send
                          size={20}
                          className="stroke-[2] translate-x-[-1px] translate-y-[1px]"
                        />
                      )}
                      {isMax && <Bot size={20} className="stroke-[2]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm md:text-base">
                          {isEmail
                            ? t("settings.methodEmailAddress")
                            : isTelegram
                              ? t("settings.methodTelegramBot")
                              : t("settings.methodMaxBot")}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                          {t("settings.connected")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold font-mono mt-1">
                        {isEmail
                          ? method.value
                          : `${t("settings.chatIdPrefix")} ${method.value}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Three-dots styled container with direct delete or dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === method.id ? null : method.id,
                          )
                        }
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        title="Options"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === method.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-32 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl z-20 animate-fade-in">
                            <button
                              type="button"
                              onClick={() => {
                                deleteNotificationMethod(method.id);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              <span>{t("common.delete")}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {(!notificationMethods || notificationMethods.length === 0) && (
            <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-semibold">
              {t("settings.noMethodsAdded")}
            </div>
          )}
        </div>

        {/* Connect New Channel Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-800">
            {t("settings.connectNewChannel")}
          </h4>

          {reachedLimit ? (
            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-center gap-3 text-xs text-amber-800 font-semibold">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
              <span>{t("settings.methodsLimitReached")}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full max-w-xs space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("settings.methodType")}
                </label>
                <div className="relative">
                  <select
                    value={newMethodType}
                    onChange={(e) => setNewMethodType(e.target.value as any)}
                    className="w-full pl-3 pr-10 py-3 border border-slate-200 rounded-2xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none font-bold shadow-sm cursor-pointer"
                  >
                    <option value="email">{t("settings.typeEmail")}</option>
                    <option value="telegram">
                      {t("settings.typeTelegram")}
                    </option>
                    <option value="max">{t("settings.typeMax")}</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Email Form */}
              {newMethodType === "email" && (
                <form
                  onSubmit={handleAddEmail}
                  className="flex gap-3 max-w-lg items-end"
                >
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("settings.methodValue")}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t("settings.methodValuePlaceholder")}
                      value={newMethodValue}
                      onChange={(e) => setNewMethodValue(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold p-3.5 rounded-2xl shadow-md transition-all active:scale-95 w-12 h-12 shrink-0 border border-indigo-600"
                  >
                    <Plus size={20} className="stroke-[2.5]" />
                  </button>
                </form>
              )}

              {/* Telegram & Max Bot Instructions (Nested Violet Card) */}
              {(newMethodType === "telegram" || newMethodType === "max") && (
                <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/10 max-w-lg space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 flex-shrink-0">
                      <Bot className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-extrabold text-slate-800 leading-snug">
                        {t("settings.connectBotTitle").replace(
                          "{{bot}}",
                          newMethodType === "telegram" ? "Telegram" : "Max",
                        )}
                      </h5>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        {t("settings.connectBotDescription")}
                      </p>
                    </div>
                  </div>

                  {userUuid ? (
                    <a
                      href={
                        newMethodType === "telegram"
                          ? `https://t.me/${botsConfig.tg_bot}?start=${userUuid}`
                          : `https://max.ru/${botsConfig.max_bot}?start=${userUuid}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 border border-indigo-600"
                    >
                      <ExternalLink size={12} className="stroke-[2.5]" />
                      <span>
                        {t(
                          newMethodType === "telegram"
                            ? "settings.openInTelegram"
                            : "settings.openInMax",
                        )}
                      </span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold animate-pulse block">
                      {t("settings.generatingLink")}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Help Bottom Card Widget ("Нужна помощь?") */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/40 shadow-sm shadow-slate-200/30">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left z-10">
          {/* Custom vector illustration block */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 scale-95 hover:scale-100 transition-transform">
            <MessageSquare size={26} className="stroke-[2]" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-ping" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 leading-snug">
              {t("settings.helpTitle")}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {t("settings.helpDesc")}
            </p>
          </div>
        </div>

        <a
          href="https://t.me/+375259863436"
          target="_blank"
          rel="noreferrer"
          className="mt-6 md:mt-0 w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs shadow-sm hover:shadow-md transition-all shrink-0 active:scale-95"
        >
          <Mail size={14} className="stroke-[2]" />
          <span>{t("settings.writeToSupport")}</span>
        </a>
      </div>
    </div>
  );
}
