import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Юридическая информация',
  description: 'Официальные реквизиты индивидуального предпринимателя Лебедевой Екатерины Владимировны и контактные данные сервиса reAnswer.',
};

export default function LegalInfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
