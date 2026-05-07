import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your reAnswer account to manage your Wildberries review automation rules.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
