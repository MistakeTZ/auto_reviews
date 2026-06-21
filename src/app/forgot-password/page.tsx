"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || t("auth.connectionError"));
      }
    } catch {
      setError(t("auth.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t("auth.resetPassword")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 bg-green-900/30 text-green-600 text-green-400 text-xl font-bold">
                ✓
              </div>
              <p className="text-gray-600 text-gray-300 text-sm">
                {t("auth.checkEmail")}
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-purple-600 hover:underline text-sm font-medium"
                >
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : t("auth.sendResetLink")}
              </Button>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-purple-600 hover:underline text-sm font-medium"
                >
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
