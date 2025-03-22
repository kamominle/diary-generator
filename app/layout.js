import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Noto_Sans_JP, Roboto_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-sans-jp" });

export default function RootLayout({ children }) {
  return (
<html lang="ja" className={`${robotoMono.variable} ${notoSansJP.className}`}>
      <head>
        <title>代筆くん 自動手記ひつじサービス</title>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-5NHDQB8L"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "http://schema.org",
              "@type": "WebSite",
              "name": "AI代筆くん",
              "url": "https://diary-generator.vercel.app/"
            }),
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5NHDQB8L"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}