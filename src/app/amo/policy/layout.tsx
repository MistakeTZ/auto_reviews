import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Правила сбора, обработки, защиты и хранения персональной информации пользователей для виджета amoCRM.',
};

export default function AmoPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
