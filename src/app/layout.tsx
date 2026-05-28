import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://autoreviews.app"),
  title: {
    default: "reAnswer — Smart Wildberries Review Automation",
    template: "%s | reAnswer"
  },
  description: "Automate your Wildberries review responses using AI. Boost your seller rating, save time, and increase sales with smart rule-based auto-replies.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex min-h-screen antialiased overflow-x-hidden`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}