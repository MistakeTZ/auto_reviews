"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

function ResetPasswordContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("auth.resetFailed"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || t("auth.resetFailed"));
      }
    } catch {
      setError(t("auth.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-red-500 text-sm font-medium">
          {t("auth.resetFailed")}
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
    );
  }

  return (
    <>
      {success ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 bg-green-900/30 text-green-600 text-green-400 text-xl font-bold">
            ✓
          </div>
          <p className="text-gray-600 text-gray-300 text-sm">
            {t("auth.passwordResetSuccess")}
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
              {t("auth.newPassword")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : t("auth.resetPassword")}
          </Button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t("auth.resetPassword")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                Loading...
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
