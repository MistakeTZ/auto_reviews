import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вопросы покупателей',
  description: 'Просматривайте входящие вопросы покупателей Wildberries в одном месте.',
  robots: { index: false, follow: false },
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}