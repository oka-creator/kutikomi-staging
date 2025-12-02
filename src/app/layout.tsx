import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import dynamic from 'next/dynamic';
import "./globals.css";

const DynamicToaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "クチコミファースト", // サイトのタイトルを適切なものに変更してください
  description: "Google Mapへのクチコミを生成AIを使って行うサービスになります", // サイトの説明を適切なものに変更してください
  icons: {
    icon: [
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/1616.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/3232.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/4848.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className={notoSansJP.className}>
        {children}
        <DynamicToaster />
      </body>
    </html>
  );
}