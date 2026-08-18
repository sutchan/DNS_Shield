// src/app/layout.tsx v3.7.50
import type { ReactNode } from 'react';
import './globals.css';
import { Inter, JetBrains_Mono, Noto_Sans_SC } from 'next/font/google';
import { metadata, viewport, jsonLd } from './site-meta';
import { APP_VERSION } from '../config/version';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { loadDictionary } from '../utils/i18n';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

export { metadata, viewport };

const dictionary = loadDictionary();
const defaultLang = 'zh-cn';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="version" content={APP_VERSION} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable}`}
        id="app-body"
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow">
          跳到主要内容
        </a>
        <Header dictionary={dictionary} defaultLang={defaultLang} />
        <main id="main-content" className="flex min-h-screen flex-col">
          {children}
        </main>
        <Footer version={APP_VERSION} />
      </body>
    </html>
  );
}
