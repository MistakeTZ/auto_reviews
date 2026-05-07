import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://autoreviews.app"),
  title: {
    default: "reAnswer — Smart Wildberries Review Automation",
    template: "%s | reAnswer"
  },
  description: "Automate your Wildberries review responses using AI. Boost your seller rating, save time, and increase sales with smart rule-based auto-replies.",
  keywords: ["wildberries", "wb", "отзывы wildberries", "автоответы", "reviews", "automation", "ai replies", "seller rating", "autoresponder", "wildberries автоответ"],
  authors: [{ name: "reAnswer Team" }],
  alternates: {
    canonical: "https://autoreviews.app",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: "en_US",
    url: "https://autoreviews.app",
    title: "reAnswer — Smart Wildberries Review Automation",
    description: "Automate your Wildberries review responses using AI. Boost your seller rating and save hours of manual work.",
    siteName: "reAnswer",
  },
  twitter: {
    card: "summary_large_image",
    title: "reAnswer — Smart Wildberries Review Automation",
    description: "Automate your Wildberries review responses using AI. Boost your seller rating and save hours of manual work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex min-h-screen`}>
        <Sidebar />
        <div className="flex-1 overflow-y-auto w-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
