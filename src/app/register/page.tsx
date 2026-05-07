"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterPage() {
  const login = useAppStore(state => state.login);
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password && name) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const regRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password })
        });

        if (regRes.ok) {
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
      } catch (err) {
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
