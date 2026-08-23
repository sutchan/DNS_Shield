// src/app/layout.tsx v3.8.0
import type { ReactNode } from 'react';
import './globals.css';
import { Inter, JetBrains_Mono, Noto_Sans_SC, Spectral } from 'next/font/google';
import { metadata, viewport, jsonLd } from './(seo)/site-meta';
import { APP_VERSION } from '../config/version';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-spectral',
  display: 'swap',
});
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

export { metadata, viewport };

// Google Analytics 4 衡量 ID：优先取环境变量，缺省回退到项目约定 ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-1VNKFYGRXR';

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
        {/* Google Analytics 4（gtag）：在合适位置注入分析脚本，衡量站点流量 */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} ${spectral.variable}`}
        id="app-body"
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow">
          跳到主要内容
        </a>
        <div id="app-shell" className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
