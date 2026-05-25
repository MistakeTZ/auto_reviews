"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

function RegisterPageContent() {
  const login = useAppStore(state => state.login);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    const refFromQuery = searchParams.get('ref')?.trim() || '';
    if (refFromQuery) {
      localStorage.setItem('pendingReferralCode', refFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password && name) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';
        const pendingReferralCode = localStorage.getItem('pendingReferralCode')?.trim() || '';
        const payload = {
          email,
          name,
          password,
          ...(pendingReferralCode ? { referral_code: pendingReferralCode } : {})
        };
        const regRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (regRes.ok) {
          if (pendingReferralCode) {
            localStorage.removeItem('pendingReferralCode');
          }
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);

          const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
          });

          if (loginRes.ok) {
            const data = await loginRes.json();
            login(data.access_token);
            router.push('/dashboard');
          } else {
            setError('Login failed after registration');
          }
        } else {
          setError('Registration failed (maybe email already in use?)');
        }
      } catch {
        setError('Connection error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('auth.createAccount')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white  border border-gray-300  rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">{t('common.signUp')}</Button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 ">
            {t('auth.hasAccount')} <Link href="/login" className="text-purple-600 hover:underline">{t('auth.signIn')}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
