import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Рефералы и тарифы',
  description: 'Приглашайте коллег и друзей в reAnswer, управляйте подпиской и получайте дополнительные дни Premium тарифа бесплатно.',
  robots: { index: false, follow: false },
};

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
