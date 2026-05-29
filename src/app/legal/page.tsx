"use client";

import React, { useState } from "react";
import LegalDocLayout from "@/components/ui/LegalDocLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { Copy, Check, Shield, User, Landmark, Mail, Phone } from "lucide-react";

export default function LegalInfoPage() {
  const { t, language } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isRu = language === "ru";

  const legalDetails = {
    name: "Индивидуальный предприниматель Лебедева Екатерина Владимировна",
    shortName: "ИП Лебедева Е.В.",
    inn: "371119373205",
    ogrnip: "326370000028346",
    email: "lebedevaekw@yandex.ru",
    phone: "+7 910 697-44-91",
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <LegalDocLayout
      title={isRu ? "Юридическая информация" : "Legal Information"}
      subtitle={
        isRu
          ? "Официальные реквизиты индивидуального предпринимателя и контактная информация"
          : "Official registration details of the entrepreneur and contact info"
      }
      lastUpdated={isRu ? "Актуально на 2026 год" : "Actual for 2026"}
    >
      <div className="space-y-8">
        {/* Intro */}
        <p className="text-slate-600">
          {isRu
            ? "В данном разделе представлены официальные регистрационные данные и реквизиты лица, являющегося владельцем и оператором сервиса reAnswer. Информация размещена в соответствии с законодательством Российской Федерации."
            : "This section provides official registration credentials of the entity that owns and operates the reAnswer service. The details are published in accordance with the legislation of the Russian Federation."}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Card 1: Full Name */}
          <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {isRu ? "Наименование" : "Entity Name"}
                </span>
                <p className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                  {legalDetails.name}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(legalDetails.name, "name")}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "name" ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-500">{isRu ? "Скопировано" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="group-hover:scale-105 transition-transform" />
                    <span>{isRu ? "Копировать" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Short Name */}
          <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {isRu ? "Сокращенное наименование" : "Shortened Name"}
                </span>
                <p className="font-bold text-slate-800 text-base leading-snug">
                  {legalDetails.shortName}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(legalDetails.shortName, "shortName")}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "shortName" ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-500">{isRu ? "Скопировано" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="group-hover:scale-105 transition-transform" />
                    <span>{isRu ? "Копировать" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: INN */}
          <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  ИНН
                </span>
                <p className="font-mono font-bold text-slate-800 text-lg leading-none">
                  {legalDetails.inn}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(legalDetails.inn, "inn")}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "inn" ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-500">{isRu ? "Скопировано" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="group-hover:scale-105 transition-transform" />
                    <span>{isRu ? "Копировать" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 4: OGRNIP */}
          <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  ОГРН / ОГРНИП
                </span>
                <p className="font-mono font-bold text-slate-800 text-lg leading-none">
                  {legalDetails.ogrnip}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(legalDetails.ogrnip, "ogrnip")}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "ogrnip" ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-500">{isRu ? "Скопировано" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="group-hover:scale-105 transition-transform" />
                    <span>{isRu ? "Копировать" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 5: Email */}
          <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email
                </span>
                <a
                  href={`mailto:${legalDetails.email}`}
                  className="font-bold text-indigo-600 hover:underline text-base leading-none"
                >
                  {legalDetails.email}
                </a>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(legalDetails.email, "email")}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "email" ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-500">{isRu ? "Скопировано" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="group-hover:scale-105 transition-transform" />
                    <span>{isRu ? "Копировать" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 6: Phone */}
          <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {isRu ? "Телефон" : "Phone"}
                </span>
                <a
                  href={`tel:${legalDetails.phone.replace(/[^+\d]/g, "")}`}
                  className="font-bold text-indigo-600 hover:underline text-base leading-none"
                >
                  {legalDetails.phone}
                </a>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(legalDetails.phone, "phone")}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "phone" ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-500">{isRu ? "Скопировано" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="group-hover:scale-105 transition-transform" />
                    <span>{isRu ? "Копировать" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimers / Terms overview */}
        <div className="mt-8 p-5 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500 leading-relaxed bg-slate-50/30">
          <h3 className="font-bold text-slate-700 mb-2">
            {isRu ? "Обратите внимание" : "Important Note"}
          </h3>
          <p className="mb-2">
            {isRu
              ? "Все права на Сайт и его программные компоненты принадлежат непосредственно ИП Лебедевой Екатерине Владимировне. Копирование структуры кода, дизайна или торговых марок reAnswer без письменного разрешения запрещено."
              : "All rights to the Site and its software components belong directly to IP Lebedeva Ekaterina Vladimirovna. Copying the code structure, design, or trademarks of reAnswer without written permission is prohibited."}
          </p>
          <p>
            {isRu
              ? "Если у вас возникли споры, вопросы по оплате, возврату средств или предложения по сотрудничеству, пожалуйста, воспользуйтесь указанными контактными данными для оперативного урегулирования."
              : "If you have disputes, billing questions, refund requests, or partnership offers, please use the contact details provided above for quick resolution."}
          </p>
        </div>
      </div>
    </LegalDocLayout>
  );
}
