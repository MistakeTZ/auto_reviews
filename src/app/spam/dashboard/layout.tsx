import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Периодическая рассылка",
  description:
    "Настраивайте периодическую рассылку сообщений в чаты покупателей Wildberries.",
  robots: { index: false, follow: false },
};

export default function SpamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

