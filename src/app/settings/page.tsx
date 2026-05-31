"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
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
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FlagSwitcher from "@/components/ui/FlagSwitcher";
import { trackMetrikaGoal } from "@/lib/metrika";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
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

  const { t, language, setLanguage } = useTranslation();
  const [tokenInput, setTokenInput] = useState(apiToken || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [isTokenGuideOpen, setIsTokenGuideOpen] = useState(false);

  // Notification states
  const [newMethodType, setNewMethodType] = useState<
    "telegram" | "email" | "max"
  >("telegram");
  const [newMethodValue, setNewMethodValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [botsConfig, setBotsConfig] = useState(DEFAULT_BOTS_CONFIG);

  // Initial load
  useEffect(() => {
    fetchNotificationMethods();
    fetchMe();

    // Fetch bots configuration
    fetch(`${API_URL}/settings/bots-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.tg_bot || data.max_bot)) {
          setBotsConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Error loading bots config:", err));
  }, [fetchNotificationMethods, fetchMe]);

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

  return (
    <div className="pt-24 px-4 pb-8 md:p-8 w-full max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("landing.toggleLanguage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 font-semibold"
          >
            <FlagSwitcher />
            <span>{language === "en" ? "English" : "Русский"}</span>
          </button>
        </CardContent>
      </Card>

      {/* WB Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.wbApiIntegration")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!apiToken ? (
            <div className="bg-orange-50/50 border border-orange-100 text-slate-800 p-4 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle
                size={20}
                className="mt-0.5 flex-shrink-0 text-orange-500"
              />
              <div>
                <p className="font-semibold mb-1">
                  {t("settings.apiTokenNotSet")}
                </p>
                <p>{t("settings.apiTokenNotSetDesc")}</p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50/50 border border-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 text-sm">
              <CheckCircle2
                size={20}
                className="flex-shrink-0 text-green-600"
              />
              <p className="font-medium">{t("settings.apiConnected")}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  {t("settings.tokenGuideTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTokenGuideOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  aria-expanded={isTokenGuideOpen}
                  aria-controls="wb-token-guide-content"
                >
                  {isTokenGuideOpen
                    ? t("settings.tokenGuideHide")
                    : t("settings.tokenGuideShow")}
                  {isTokenGuideOpen ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              </div>

              {isTokenGuideOpen && (
                <div id="wb-token-guide-content" className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {t("settings.tokenGuideIntro")}
                  </p>
                  <p className="text-sm font-medium text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    {t("settings.tokenGuideDesktopNote")}
                  </p>

                  <ol className="space-y-3 text-sm text-slate-700 list-decimal pl-5">
                    <li>
                      <span className="font-semibold text-slate-900">
                        {t("settings.tokenGuideStep1Title")}
                      </span>{" "}
                      {t("settings.tokenGuideStep1Desc")}
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">
                        {t("settings.tokenGuideStep2Title")}
                      </span>{" "}
                      {t("settings.tokenGuideStep2Desc")}
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">
                        {t("settings.tokenGuideStep3Title")}
                      </span>{" "}
                      {t("settings.tokenGuideStep3Desc")}
                    </li>
                  </ol>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <figure className="space-y-2">
                      <a
                        href="/api_integration.webp"
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-slate-200 bg-white transition-transform hover:scale-[1.01]"
                      >
                        <Image
                          src="/api_integration.webp"
                          alt={t("settings.tokenGuideImg1Alt")}
                          width={1200}
                          height={800}
                          className="h-auto w-full object-cover"
                        />
                      </a>
                      <figcaption className="text-xs text-slate-500">
                        {t("settings.tokenGuideImg1Caption")}
                      </figcaption>
                    </figure>

                    <figure className="space-y-2">
                      <a
                        href="/new_token.webp"
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-slate-200 bg-white transition-transform hover:scale-[1.01]"
                      >
                        <Image
                          src="/new_token.webp"
                          alt={t("settings.tokenGuideImg2Alt")}
                          width={1200}
                          height={800}
                          className="h-auto w-full object-cover"
                        />
                      </a>
                      <figcaption className="text-xs text-slate-500">
                        {t("settings.tokenGuideImg2Caption")}
                      </figcaption>
                    </figure>

                    <figure className="space-y-2">
                      <a
                        href="/token_params.webp"
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-slate-200 bg-white transition-transform hover:scale-[1.01]"
                      >
                        <Image
                          src="/token_params.webp"
                          alt={t("settings.tokenGuideImg3Alt")}
                          width={1200}
                          height={800}
                          className="h-auto w-full object-cover"
                        />
                      </a>
                      <figcaption className="text-xs text-slate-500">
                        {t("settings.tokenGuideImg3Caption")}
                      </figcaption>
                    </figure>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("settings.tokenGuidePermissionsNote")}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("settings.apiToken")}
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={tokenInput || apiToken || ""}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-slate-800"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 focus:outline-none"
                >
                  {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {t("settings.neverShareToken")}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50/50 border border-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-red-500"
                />
                <div>
                  <p className="font-semibold mb-1">
                    {t("settings.tokenError")}
                  </p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={!tokenInput || isVerifying || tokenInput === apiToken}
            >
              {isVerifying
                ? t("settings.verifying")
                : !apiToken
                  ? t("settings.verifySave")
                  : t("settings.updateToken")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Methods Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <CardTitle>
                {t("settings.notifMethods")}{" "}
                <span className="text-xs font-normal text-slate-400">
                  {t("settings.maxMethodsShort")}
                </span>
              </CardTitle>
            </div>
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              title={t("settings.refreshList")}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("settings.notifMethodsDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Methods List */}
          <div className="space-y-3">
            {notificationMethods &&
              notificationMethods.map((method) => {
                const isTelegram = method.type === "telegram";
                const isMax = method.type === "max";
                const isEmail = method.type === "email";

                return (
                  <div
                    key={method.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-lg ${
                          isEmail
                            ? "bg-blue-50 text-blue-600"
                            : isTelegram
                              ? "bg-sky-50 text-sky-600"
                              : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {isEmail && <Mail size={18} />}
                        {isTelegram && <Send size={18} />}
                        {isMax && <Bot size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {isEmail
                              ? t("settings.methodEmailAddress")
                              : isTelegram
                                ? t("settings.methodTelegramBot")
                                : t("settings.methodMaxBot")}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {t("settings.connected")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {isEmail
                            ? method.value
                            : `${t("settings.chatIdPrefix")} ${method.value}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => deleteNotificationMethod(method.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={t("settings.removeMethod")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

            {(!notificationMethods || notificationMethods.length === 0) && (
              <div className="text-center py-6 text-slate-400 text-sm">
                {t("settings.noMethodsAdded")}
              </div>
            )}
          </div>

          {/* Add New Method Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">
              {t("settings.connectNewChannel")}
            </h3>

            {reachedLimit ? (
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg flex items-center gap-2.5 text-xs text-amber-800">
                <AlertCircle
                  size={16}
                  className="text-amber-500 flex-shrink-0"
                />
                <span>{t("settings.methodsLimitReached")}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full max-w-xs space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("settings.methodType")}
                  </label>
                  <select
                    value={newMethodType}
                    onChange={(e) => setNewMethodType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="email">{t("settings.typeEmail")}</option>
                    <option value="telegram">
                      {t("settings.typeTelegram")}
                    </option>
                    <option value="max">{t("settings.typeMax")}</option>
                  </select>
                </div>

                {/* Email Add Form */}
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 h-[38px]"
                    >
                      <Plus size={16} />
                      {/* <span>{t('settings.addMethod')}</span> */}
                    </Button>
                  </form>
                )}

                {/* Telegram & Max Bot Connection Cards */}
                {(newMethodType === "telegram" || newMethodType === "max") && (
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 max-w-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">
                          {t("settings.connectBotTitle").replace(
                            "{{bot}}",
                            newMethodType === "telegram" ? "Telegram" : "Max",
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md hover:shadow-indigo-600/20"
                      >
                        <ExternalLink size={14} />
                        <span>
                          {t(
                            newMethodType === "telegram"
                              ? "settings.openInTelegram"
                              : "settings.openInMax",
                          )}
                        </span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 animate-pulse">
                        {t("settings.generatingLink")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
