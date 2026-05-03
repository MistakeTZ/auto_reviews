"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function DemoPage() {
  const login = useAppStore(state => state.login);
  const router = useRouter();

  useEffect(() => {
    // Quickly set auth to true for demo purposes and redirect
    login('dummy_demo_token');
    router.push('/dashboard');
  }, [login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-pulse text-purple-600 font-semibold text-lg">
        Setting up demo environment...
      </div>
    </div>
  );
}
