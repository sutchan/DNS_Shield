// src/app/layout.tsx v2.2.2
import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DNS Shield v2.2.1',
  description: 'DNS Shield - 路由器级全局广告过滤规则生成工具。基于 dnsmasq/hosts 的路由器广告过滤，支持梅林固件、小米路由器、OpenWrt 等设备。',
  keywords: 'DNS广告过滤,dnsmasq,hosts,广告拦截,路由器,梅林固件,小米路由器,OpenWrt,广告过滤规则,DNS Shield',
  authors: { name: 'sutchan' },
  robots: 'index, follow',
  openGraph: {
    title: 'DNS Shield - 路由器广告过滤',
    description: '路由器级全局广告过滤规则生成工具，支持 Dnsmasq 和 Hosts 格式',
    type: 'website',
    url: 'https://github.com/sutchan/DNS_Shield',
    images: [
      {
        url: 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/preview.png',
        width: 1200,
        height: 630,
        alt: 'DNS Shield',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
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

export const viewport = {
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
