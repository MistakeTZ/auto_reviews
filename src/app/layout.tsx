import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoReviews - Wildberries Automation",
  description: "Automate your Wildberries review responses.",
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
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
