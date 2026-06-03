"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { trackMetrikaGoal } from "@/lib/metrika";

function RegisterPageContent() {
  const login = useAppStore((state) => state.login);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [promoBonusDays, setPromoBonusDays] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    const refFromQuery = searchParams.get("ref")?.trim() || "";
    if (refFromQuery) {
      localStorage.setItem("pendingReferralCode", refFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const code = promoCode.trim();
    if (!code) {
      setPromoChecking(false);
      setPromoValid(null);
      setPromoBonusDays(0);
      setPromoMessage("");
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setPromoChecking(true);
      try {
        const res = await fetch(
          `${API_URL}/auth/check-promocode?code=${encodeURIComponent(code)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        const isValid = Boolean(data.valid);
        setPromoValid(isValid);
        setPromoBonusDays(Number(data.days_on_registration || 0));
        setPromoMessage(String(data.message || ""));
      } catch {
        if (cancelled) return;
        setPromoValid(false);
        setPromoBonusDays(0);
        setPromoMessage(
          language === "ru"
            ? "Не удалось проверить промокод"
            : "Could not verify promo code",
        );
      } finally {
        if (!cancelled) setPromoChecking(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [promoCode, API_URL, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email && password && name) {
      try {
        const pendingReferralCode =
          localStorage.getItem("pendingReferralCode")?.trim() || "";
        const trimmedPromoCode = promoCode.trim();
        const payload = {
          email,
          name,
          password,
          ...(pendingReferralCode
            ? { referral_code: pendingReferralCode }
            : {}),
          ...(trimmedPromoCode ? { promo_code: trimmedPromoCode } : {}),
        };
        const regRes = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (regRes.ok) {
          trackMetrikaGoal(
            "userRegistered",
            `userRegistered:${email.trim().toLowerCase()}`,
          );
          if (pendingReferralCode) {
            localStorage.removeItem("pendingReferralCode");
          }
          const formData = new URLSearchParams();
          formData.append("username", email);
          formData.append("password", password);

          const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
          });

          if (loginRes.ok) {
            const data = await loginRes.json();
            login(data.access_token);
            router.push("/dashboard");
          } else {
            setError(t("auth.loginAfterRegisterFailed"));
          }
        } else {
          const errData = await regRes.json().catch(() => ({}));
          setError(
            String(errData.detail || t("auth.registrationFailedMaybeEmail")),
          );
        }
      } catch {
        setError(t("auth.connectionError"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t("auth.createAccount")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("auth.fullName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="hidden">
              <label className="block text-sm font-medium mb-1">
                {t("auth.promoCode")}
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={t("auth.promoCodeOptional")}
              />
              {promoCode.trim() && (
                <p
                  className={`mt-2 text-xs ${
                    promoChecking
                      ? "text-slate-500"
                      : promoValid
                        ? "text-green-600"
                        : "text-red-500"
                  }`}
                >
                  {promoChecking
                    ? t("auth.promoChecking")
                    : promoValid
                      ? promoBonusDays > 0
                        ? `${t("auth.promoValidPrefix")} +${promoBonusDays} ${t("auth.promoDaysSuffix")}`
                        : t("auth.promoValid")
                      : promoMessage || t("auth.promoInvalid")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("common.signUp")}
            </Button>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 ">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              {t("auth.signIn")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
