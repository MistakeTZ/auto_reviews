import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Questions Inbox',
  description: 'View incoming Wildberries buyer questions in one place.',
  robots: { index: false, follow: false },
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}