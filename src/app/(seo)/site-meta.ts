// src/app/(seo)/site-meta.ts v3.19.1
// 站点 metadata / viewport：从 layout.tsx 拆分以保持单文件职责清晰。
// v3.18.0：SITE_URL 等常量收敛到 src/config/site.ts；站点事实文本收敛到 seo-content.ts。
// v3.19.1：标题/描述抽到 meta-content.ts 共享；JSON-LD @graph 抽到 json-ld.ts（守 200 行上限），
//   对外导出契约不变（layout.tsx 仍从本文件 import metadata / viewport / jsonLd）。
// robots.ts / sitemap.ts 属 Next 约定文件须留在 app/ 根，不在此组。
import type { Metadata, Viewport } from 'next';
import {
  SITE_URL, GITHUB_URL, SITE_NAME, OG_IMAGE_PATH, OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT, ICON_512_PATH,
} from '../../config/site';
import { TITLE, DESCRIPTION } from './meta-content';

// 站点验证仅在配置了真实 token 时输出；占位值会向搜索引擎声明无效的验证 meta。
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // 标题不嵌版本号：版本随发版频繁变化会造成标题漂移，不利于关键词稳定性。
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  category: 'technology',
  keywords: [
    'DNS广告过滤', 'dnsmasq', 'hosts', '广告拦截', '路由器', '梅林固件', '小米路由器',
    'OpenWrt', '广告过滤规则', 'DNS Shield', 'ad blocking', 'router firmware',
    'AdBlock', 'DNS filter', '广告屏蔽', '去广告', 'AdGuard', 'Pi-hole', 'Clash Meta',
  ],
  authors: [{ name: 'sutchan', url: GITHUB_URL }],
  creator: 'sutchan',
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'default' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: ['en_US', 'zh_TW'],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE_PATH, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: `${SITE_NAME} - 路由器广告过滤规则生成器` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE_PATH],
    creator: '@sutchan',
  },
  alternates: {
    // 语言为客户端切换（单页无 /en、/zh-TW 独立路由），不输出 hreflang，
    // 避免指向不存在路径被搜索引擎判 404（2026-11-07 线上分析修正）。
    // v3.20.1：与 sitemap 的 `${SITE_URL}/` 及 next.config.js trailingSlash:true 保持一致
    canonical: `${SITE_URL}/`,
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  // 仅声明国家/地区（CN）。geo.placename 语义上应为真实地名，本项目为在线服务无实体地点，
  // 用站点名填充属语义错误，故省略（避免向抓取器输出无效地理标签）。
  other: {
    'geo.region': 'CN',
  },
  icons: [
    { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '72x72', url: '/assets/icons/icon-72x72.png' },
    { rel: 'icon', type: 'image/png', sizes: '96x96', url: '/assets/icons/icon-96x96.png' },
    { rel: 'icon', type: 'image/png', sizes: '128x128', url: '/assets/icons/icon-128x128.png' },
    { rel: 'icon', type: 'image/png', sizes: '144x144', url: '/assets/icons/icon-144x144.png' },
    { rel: 'icon', type: 'image/png', sizes: '152x152', url: '/assets/icons/icon-152x152.png' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/assets/icons/icon-192x192.png' },
    { rel: 'icon', type: 'image/png', sizes: '384x384', url: '/assets/icons/icon-384x384.png' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', url: ICON_512_PATH },
    { rel: 'apple-touch-icon', url: '/assets/icons/icon-192x192.png' },
  ],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D5FE2' },
    { media: '(prefers-color-scheme: dark)', color: '#2674F2' },
  ],
};

// JSON-LD 结构化数据已按职责抽离；re-export 保持 layout.tsx 的导入契约不变
export { jsonLd } from './json-ld';
