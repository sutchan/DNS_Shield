// src/app/(seo)/site-meta.ts v3.8.1
// 站点元数据与 JSON-LD 结构常量，从 layout.tsx 拆分以保持单文件职责清晰。
// 版本号统一引用单一来源 APP_VERSION，避免硬编码漂移。
// 归入 (seo) 路由组目录，集中管理 SEO/元数据相关模块；
// robots.ts / sitemap.ts 属 Next 约定文件须留在 app/ 根，不在此组。
import type { Metadata, Viewport } from 'next';
import { APP_VERSION } from '../../config/version';

const SITE_URL = 'https://dns.ewuse.com';
const GITHUB_URL = 'https://github.com/sutchan/DNS_Shield';
const ICON_512 =
  'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/assets/icons/icon-512x512.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `DNS Shield v${APP_VERSION} - 路由器级广告过滤规则生成工具`,
    template: '%s | DNS Shield',
  },
  description: `DNS Shield v${APP_VERSION} - 路由器级全局广告过滤规则生成工具。基于 dnsmasq/hosts 的路由器广告过滤，支持梅林固件、小米路由器、OpenWrt 等设备。自动生成 AdBlock、DNS 过滤规则，轻松屏蔽广告域名。`,
  keywords: ['DNS广告过滤', 'dnsmasq', 'hosts', '广告拦截', '路由器', '梅林固件', '小米路由器', 'OpenWrt', '广告过滤规则', 'DNS Shield', 'ad blocking', 'router firmware', 'AdBlock', 'DNS filter', '广告屏蔽', '去广告'],
  authors: [{ name: 'sutchan', url: GITHUB_URL }],
  creator: 'sutchan',
  publisher: 'DNS Shield',
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
    siteName: 'DNS Shield',
    title: `DNS Shield v${APP_VERSION} - 路由器级广告过滤规则生成工具`,
    description: '路由器级全局广告过滤规则生成工具，支持 Dnsmasq 和 Hosts 格式',
    images: [{ url: ICON_512, width: 1200, height: 630, alt: 'DNS Shield - 路由器广告过滤工具' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNS Shield - 路由器广告过滤',
    description: '路由器级全局广告过滤规则生成工具',
    images: [ICON_512],
    creator: '@sutchan',
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-US': `${SITE_URL}/en`,
      'zh-TW': `${SITE_URL}/zh-TW`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || 'google-site-verification-code',
  },
  other: {
    'geo.region': 'CN',
    'geo.placename': 'DNS Shield',
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
    { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/assets/icons/icon-512x512.png' },
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

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DNS Shield',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  applicationSubCategory: 'Ad Blocking',
  softwareVersion: APP_VERSION,
  description:
    '路由器级全局广告过滤规则生成工具。基于 dnsmasq/hosts 的路由器广告过滤，支持梅林固件、小米路由器、OpenWrt 等设备。自动生成 AdBlock、DNS 过滤规则，轻松屏蔽广告域名。',
  url: SITE_URL,
  downloadUrl: GITHUB_URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
  author: { '@type': 'Person', name: 'sutchan', url: GITHUB_URL },
  featureList: [
    '支持 Dnsmasq、Hosts、AdGuard、Unbound、Pi-hole、Bind RPZ、SmartDNS 等格式规则生成',
    '兼容梅林固件、小米路由器、OpenWrt',
    '自定义黑白名单管理',
    '实时预览过滤规则',
    '一键复制/下载规则文件',
  ],
  inLanguage: ['zh-CN', 'en-US'],
  screenshot: ICON_512,
};
