import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Правила автоответов',
  description: 'Создавайте и управляйте умными правилами автоответов для ваших отзывов Wildberries — фильтруйте по рейтингу, товару или ключевому слову.',
  robots: { index: false, follow: false },
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
