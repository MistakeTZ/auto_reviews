import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Согласие на обработку персональных данных',
  description: 'Согласие на обработку, использование и хранение персональной информации пользователей в сервисе reAnswer.',
};

export default function PersonalDataConsentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
