import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Инструкция по получению API-токена',
  description: 'Пошаговое руководство с иллюстрациями о том, как получить API-токен Wildberries для настройки автоответов reAnswer.',
};

export default function TokenInstructionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
