// src/app/layout.tsx v2.3.0
import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://dns.ewuse.com'),
  title: {
    default: 'DNS Shield v2.3.0 - 路由器级广告过滤规则生成工具',
    template: '%s | DNS Shield',
  },
  description: 'DNS Shield - 路由器级全局广告过滤规则生成工具。基于 dnsmasq/hosts 的路由器广告过滤，支持梅林固件、小米路由器、OpenWrt 等设备。自动生成 AdBlock、DNS 过滤规则，轻松屏蔽广告域名。',
  keywords: ['DNS广告过滤', 'dnsmasq', 'hosts', '广告拦截', '路由器', '梅林固件', '小米路由器', 'OpenWrt', '广告过滤规则', 'DNS Shield', 'ad blocking', 'router firmware', 'AdBlock', 'DNS filter', '广告屏蔽', '去广告'],
  authors: [{ name: 'sutchan', url: 'https://github.com/sutchan' }],
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
    url: 'https://dns.ewuse.com',
    siteName: 'DNS Shield',
    title: 'DNS Shield v2.3.0 - 路由器级广告过滤规则生成工具',
    description: '路由器级全局广告过滤规则生成工具，支持 Dnsmasq 和 Hosts 格式',
    images: [
      {
        url: 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/preview.png',
        width: 1200,
        height: 630,
        alt: 'DNS Shield - 路由器广告过滤工具',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNS Shield - 路由器广告过滤',
    description: '路由器级全局广告过滤规则生成工具',
    images: ['https://raw.githubusercontent.com/sutchan/DNS_Shield/main/preview.png'],
    creator: '@sutchan',
  },
  alternates: {
    canonical: 'https://dns.ewuse.com',
    languages: {
      'en-US': 'https://dns.ewuse.com/en',
      'zh-TW': 'https://dns.ewuse.com/zh-TW',
    },
  },
  verification: {
    // TODO: 生产环境部署前，请替换为您实际的 Google Search Console 验证代码
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || 'google-site-verification-code',
  },
  other: {
    'geo.region': 'CN',
    'geo.placename': 'DNS Shield',
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '72x72',
      url: '/assets/icons/icon-72x72.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      url: '/assets/icons/icon-96x96.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '128x128',
      url: '/assets/icons/icon-128x128.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '144x144',
      url: '/assets/icons/icon-144x144.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '152x152',
      url: '/assets/icons/icon-152x152.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      url: '/assets/icons/icon-192x192.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '384x384',
      url: '/assets/icons/icon-384x384.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '512x512',
      url: '/assets/icons/icon-512x512.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/assets/icons/icon-192x192.png',
    },
  ],
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#007AFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A84FF' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}
