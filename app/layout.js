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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
