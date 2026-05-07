import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free reAnswer account and start automating your Wildberries review responses in minutes.',
  openGraph: {
    title: 'Sign Up — reAnswer',
    description: 'Create a free reAnswer account and start automating your Wildberries review responses in minutes.',
    url: 'https://autoreviews.app/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
