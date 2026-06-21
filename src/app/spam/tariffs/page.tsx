"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/Card";
import { CreditCard } from "lucide-react";

export default function SpamTariffsPage() {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
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
    </div>
  );
}
