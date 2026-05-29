import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дэшборд ',
  description: 'Ваш дэшборд продавца reAnswer — отслеживайте статистику отзывов, последние ответы и активность автоматизации.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
