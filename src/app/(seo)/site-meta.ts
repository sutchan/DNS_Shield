// src/app/(seo)/site-meta.ts v3.18.0
// 站点元数据与 JSON-LD 结构常量，从 layout.tsx 拆分以保持单文件职责清晰。
// v3.18.0：SITE_URL 等常量收敛到 src/config/site.ts；站点事实文本收敛到
// src/config/seo-content.ts；JSON-LD 升级为 @graph（Organization / WebSite /
// SoftwareApplication / FAQPage / HowTo），与页面可见文本同源。
// robots.ts / sitemap.ts 属 Next 约定文件须留在 app/ 根，不在此组。
import type { Metadata, Viewport } from 'next';
import { APP_VERSION } from '../../config/version';
import {
  SITE_URL, GITHUB_URL, SITE_NAME, OG_IMAGE_PATH, OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT, ICON_512_PATH, SITE_LAST_MODIFIED, IN_LANGUAGE,
} from '../../config/site';
import { ABOUT_ZH, FORMAT_NAMES, FAQ_ITEMS, HOWTO_STEPS } from '../../config/seo-content';

// 站点验证仅在配置了真实 token 时输出；占位值会向搜索引擎声明无效的验证 meta。
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;

const TITLE = `${SITE_NAME} - 路由器级广告过滤规则生成工具（12 种格式）`;
const DESCRIPTION =
  '免费开源的路由器级 DNS 广告过滤规则生成工具。在浏览器本地把域名清单转换为 Dnsmasq、Hosts、AdGuard、Pi-hole、Clash Meta 等 12 种格式，兼容梅林固件、OpenWrt、小米路由器；无需注册，域名清单不上传服务器。';

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
    canonical: SITE_URL,
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

/** @graph 中复用的 @id，保证实体之间引用正确 */
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}${ICON_512_PATH}`, width: 512, height: 512 },
      sameAs: [GITHUB_URL],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { '@id': ORG_ID },
      inLanguage: [...IN_LANGUAGE],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': APP_ID,
      name: SITE_NAME,
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Ad Blocking',
      operatingSystem: 'Web',
      browserRequirements: '需要支持 JavaScript 的现代浏览器',
      softwareVersion: APP_VERSION,
      description: ABOUT_ZH,
      url: SITE_URL,
      downloadUrl: GITHUB_URL,
      image: `${SITE_URL}${OG_IMAGE_PATH}`,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      author: { '@type': 'Person', name: 'sutchan', url: GITHUB_URL },
      publisher: { '@id': ORG_ID },
      dateModified: SITE_LAST_MODIFIED,
      featureList: [
        `支持 12 种格式规则生成：${FORMAT_NAMES.join('、')}`,
        '兼容梅林固件、小米路由器、OpenWrt、AdGuard Home、Pi-hole 等设备与软件',
        '解析与规则生成全部在浏览器本地完成，域名清单不上传服务器',
        '自定义黑名单 / 白名单 / DNS 改道，支持 URL 批量导入与实时预览',
        '一键复制 / 下载规则文件，并提供 16 种界面语言',
      ],
      inLanguage: [...IN_LANGUAGE],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      inLanguage: 'zh-CN',
      // 问题与答案必须与页面 #faq 区块的可见文本逐字一致，避免结构化数据与正文不符。
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@type': 'HowTo',
      '@id': `${SITE_URL}/#howto`,
      inLanguage: 'zh-CN',
      name: '如何使用 DNS Shield 生成路由器广告过滤规则',
      description: '从输入域名清单到导出部署的三步流程。',
      totalTime: 'PT2M',
      tool: [{ '@type': 'HowToTool', name: 'DNS Shield 在线工具（现代浏览器）' }],
      supply: [{ '@type': 'HowToSupply', name: '需要过滤的广告 / 追踪域名清单' }],
      step: HOWTO_STEPS.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
  ],
};
