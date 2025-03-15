import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: '%s | 代筆くん',
    default: '代筆くん - AIが日記を代筆',
  },
  description: 'AIが日記を代筆します。あなたの思い出を素敵な文章に。',
  openGraph: {
    title: {
      template: '%s | 代筆くん',
      default: '代筆くん - AIが日記を代筆',
    },
    description: 'AIが日記を代筆します。あなたの思い出を素敵な文章に。',
    type: 'website',
    locale: 'ja_JP',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id=GTM-5NHDQB8L'+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer');
            `,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "WebSite",
          "name": "AI代筆くん",
          "url": "https://diary-generator.vercel.app/"
        })}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5NHDQB8L"
            height="0" width="0" style={{display:"none",visibility:"hidden"}}></iframe>
        </noscript>
        {children}
      </body>
    </html>
  );
}
