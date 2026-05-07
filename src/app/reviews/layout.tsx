import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reviews Inbox',
  description: 'View and manage incoming Wildberries reviews. Reply manually or let reAnswer auto-respond based on your rules.',
  robots: { index: false, follow: false },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
