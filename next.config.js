/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Google Analytics 4 (gtag)：允许加载 gtag 脚本与上报数据
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "img-src 'self' data: https: blob: https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // 应用允许用户填入任意规则列表 URL 进行拉取，故 connect-src 放开到全部 https 源；
      // 仅限 https，禁止明文 http/其它协议，兼顾功能与安全。
      "connect-src 'self' https:",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "worker-src 'self' blob:",
      // 强制 https，避免任何明文 http 子资源被加载
      "upgrade-insecure-requests",
      // 启用 Trusted Types，配合输出渲染清洗（见 OutputPanel），杜绝 DOM XSS 注入面
      "require-trusted-types-for 'script'"
    ].join('; ')
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin'
  }
];

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // 静态导出 + Node 24 环境下禁用 next/image 优化，避免 sharp 缺失告警
  images: {
    unoptimized: true
  },
  env: {
    version: '3.9.0'
  },
  devIndicators: {
    buildActivity: false
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
}

module.exports = nextConfig
