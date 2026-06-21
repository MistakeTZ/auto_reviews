"use client";

import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Check,
  Lock,
  Copy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FlagSwitcher from "@/components/ui/FlagSwitcher";
import { trackMetrikaGoal } from "@/lib/metrika";
import NotificationMethodsSection from "@/components/settings/NotificationMethodsSection";
import HelpSection from "@/components/settings/HelpSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
type QuestionAnswerMode = "none" | "manual" | "confirm" | "auto";

export default function SettingsPage() {
  const apiToken = useAppStore((state) => state.apiToken);
  const setToken = useAppStore((state) => state.setToken);
  const fetchMe = useAppStore((state) => state.fetchMe);
  const jwtToken = useAppStore((state) => state.jwtToken);

  const { t, language, setLanguage } = useTranslation();
  const [tokenInput, setTokenInput] = useState(apiToken || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
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
  }, [fetchMe, jwtToken, t]);

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

      <NotificationMethodsSection />
      <HelpSection />
    </div>
  );
}
