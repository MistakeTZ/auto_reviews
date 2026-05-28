import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import CookieBanner from "@/components/layout/CookieBanner";

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
        <Sidebar />
        <div className="flex-1 min-w-0 overflow-y-auto w-full flex flex-col">
          {children}
        </div>
        <CookieBanner />
      </body>
    </html>
  );
}