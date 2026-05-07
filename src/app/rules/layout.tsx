import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auto-Answer Rules',
  description: 'Create and manage smart auto-reply rules for your Wildberries reviews — filter by rating, product, or keyword.',
  robots: { index: false, follow: false },
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
