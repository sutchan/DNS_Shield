// src/app/page.tsx v2.0.0
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Home from './Home';

export default function Page() {
  return (
    <>
      <Head>
        <title>DNS Shield v2.0.0</title>
        <meta name="description" content="DNS Shield - 路由器级广告过滤规则生成工具。基于 dnsmasq/hosts 的路由器广告过滤，支持梅林固件、小米路由器、OpenWrt 等设备。" />
        <meta name="keywords" content="DNS广告过滤,dnsmasq,hosts,广告拦截,路由器,梅林固件,小米路由器,OpenWrt,广告过滤规则,DNS Shield" />
        <meta name="author" content="sutchan" />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="CN" />
        <meta name="geo.placename" content="China" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DNS Shield" />
        <meta property="og:title" content="DNS Shield - 路由器广告过滤" />
        <meta property="og:description" content="路由器级广告过滤规则生成工具，支持 Dnsmasq 和 Hosts 格式" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://github.com/sutchan/DNS_Shield" />
        <meta property="og:image" content="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" sizes="72x72" href="/assets/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/assets/icons/icon-128x128.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/assets/icons/icon-144x144.png" />
        <link rel="icon" type="image/png" sizes="152x152" href="/assets/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="384x384" href="/assets/icons/icon-384x384.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Home />
    </>
  );
}