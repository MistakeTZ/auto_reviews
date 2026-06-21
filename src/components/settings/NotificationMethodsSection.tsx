"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  Bot,
  ChevronDown,
  ExternalLink,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppStore } from "@/store/useAppStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const DEFAULT_BOTS_CONFIG = {
  tg_bot: process.env.TG_BOT_NAME || "none",
  max_bot: process.env.MAX_BOT_NAME || "none",
};

type NotificationMethodType = "telegram" | "email" | "max";

export default function NotificationMethodsSection() {
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

  const { t } = useTranslation();

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [newMethodType, setNewMethodType] =
    useState<NotificationMethodType>("telegram");
  const [newMethodValue, setNewMethodValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [botsConfig, setBotsConfig] = useState(DEFAULT_BOTS_CONFIG);

  useEffect(() => {
    fetchNotificationMethods();
    fetchMe();

    fetch(`${API_URL}/settings/bots-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.tg_bot || data.max_bot)) {
          setBotsConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Error loading bots config:", err));
  }, [fetchNotificationMethods, fetchMe]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationMethods();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchNotificationMethods]);

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

  return (
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
                  onChange={(e) =>
                    setNewMethodType(e.target.value as NotificationMethodType)
                  }
                  className="w-full pl-3 pr-10 py-3 border border-slate-200 rounded-2xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none font-bold shadow-sm cursor-pointer"
                >
                  <option value="email">{t("settings.typeEmail")}</option>
                  <option value="telegram">{t("settings.typeTelegram")}</option>
                  <option value="max">{t("settings.typeMax")}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

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
  );
}
