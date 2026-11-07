/** @type {import('next').NextConfig} */

// 统一安全响应头：与 vercel.json 的 headers 保持一致（历史上两处各写一份且不同——
// 此处曾缺 HSTS/COOP/CORP/X-Frame-Options，且 frame-ancestors 为 *）。
// 改一处必须同步另一处；CI 的「安全头一致性」检查以此处为准。
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 说明：Next.js 开发模式需要 'unsafe-eval'，生产构建不需要，故不纳入
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "img-src 'self' data: https: blob: https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests"
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

// 构建编号：本地构建时间到分钟（yymmddhhmm，2 位年），由构建流程在启动时生成并注入客户端。
// 经 NEXT_PUBLIC_ 前缀暴露给浏览器端；CI 可覆盖该值以反映真实构建时间。
// 注入缺失时页脚回退为版本号（见 src/components/Footer.tsx）。
const buildTimeId = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(-2)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;
};

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    version: '3.15.4',
    NEXT_PUBLIC_BUILD_ID: buildTimeId()
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
