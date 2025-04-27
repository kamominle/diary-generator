import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { Noto_Sans_JP, Roboto_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-sans-jp" });

// JSON-LDデータを変数として定義
const jsonLd = {
  "@context": "http://schema.org",
  "@type": "WebSite",
  "name": "AI代筆くん",
  "url": "https://ai-sheep.com/",
  "description": "AIが日記や文章を自動生成するサービス。あなたの代わりに文章を作成します。",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ai-sheep.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const metadata = {
  title: '代筆くん 自動手記ひつじサービス',
  description: 'AIが日記や文章を自動生成するサービス。あなたの代わりに文章を作成します。',
  keywords: '代筆, AI, 日記, 自動生成, 文章作成',
  metadataBase: new URL('https://ai-sheep.com/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '代筆くん 自動手記ひつじサービス',
    description: 'AIが日記や文章を自動生成するサービス。あなたの代わりに文章を作成します。',
    url: 'https://ai-sheep.com/',
    siteName: 'AI代筆くん',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: 'https://ai-sheep.com/ogp.png', // OGP画像のパスを設定
        width: 1200,
        height: 630,
        alt: '代筆くん',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '代筆くん 自動手記ひつじサービス',
    description: 'AIが日記や文章を自動生成するサービス。あなたの代わりに文章を作成します。',
    images: ['https://ai-sheep.com/ogp.png'], // Twitter Card用画像
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${robotoMono.variable} ${notoSansJP.className}`}>
      <head>
        {/* next/scriptコンポーネントを使用してJSON-LDを挿入 */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5NHDQB8L"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5NHDQB8L');
          `}
        </Script>
        
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}