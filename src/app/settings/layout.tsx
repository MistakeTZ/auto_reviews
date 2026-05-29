import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Настройки',
  description: 'Настройте ваш API токен Wildberries, предпочтения уведомлений и параметры автоматизации в reAnswer.',
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
