import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Создайте бесплатный аккаунт reAnswer и начните автоматизировать ответы на отзывы Wildberries за считанные минуты.',
  openGraph: {
    title: 'Регистрация — reAnswer',
    description: 'Создайте бесплатный аккаунт reAnswer и начните автоматизировать ответы на отзывы Wildberries за считанные минуты.',
    url: 'https://autoreviews.app/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
