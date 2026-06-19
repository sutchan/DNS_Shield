/** @type {import('next').NextConfig} */

// 安全头部配置
const securityHeaders = [
  {
    // Content Security Policy - 限制资源加载来源
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 允许加载自身域名、GitHub 资源和字体服务
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://raw.githubusercontent.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://raw.githubusercontent.com https://easylist-downloads.adblockplus.org https://github.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  },
  {
    // 防止 MIME 类型嗅探
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // 防止点击劫持攻击
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    // XSS 保护
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    // 引用来源策略
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // 权限策略
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  env: {
    version: '2.3.0'
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
