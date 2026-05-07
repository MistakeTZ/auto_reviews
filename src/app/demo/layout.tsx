import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Demo',
  description: 'See reAnswer in action. Explore the dashboard, rules engine, and AI-powered review automation without creating an account.',
  openGraph: {
    title: 'Live Demo — reAnswer',
    description: 'See reAnswer in action. Explore the dashboard, rules engine, and AI-powered review automation without creating an account.',
    url: 'https://autoreviews.app/demo',
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
