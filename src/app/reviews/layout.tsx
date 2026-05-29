import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Отзывы покупателей',
  description: 'Просматривайте и управляйте входящими отзывами Wildberries. Отвечайте вручную или позвольте reAnswer автоматически отвечать на основе ваших правил.',
  robots: { index: false, follow: false },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
