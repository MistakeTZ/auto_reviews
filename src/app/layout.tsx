import type { Metadata } from "next";
import Script from "next/script";
import { Inter, PT_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const ptSans = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reanswer.ru"),
  title: {
    default: "reAnswer — AI автоответы на отзывы Wildberries",
    template: "%s | reAnswer"
  },
  description: "Автоматизируйте ответы на отзывы Wildberries с помощью ИИ. Повышайте рейтинг продавца, экономьте время и увеличивайте продажи с помощью умных автоответов на основе правил.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ptSans.variable} ${inter.className} bg-slate-50 text-slate-900 flex min-h-screen antialiased overflow-x-hidden`}>
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109492496', 'ym');

            ym(109492496, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/109492496"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}