// src/app/layout.tsx v3.19.0
// 字体策略：不使用 next/font/google。构建期它会请求 fonts.googleapis.com，
// EdgeOne / CI 等离线构建环境取不到 CSS 时，next/font loader 会抛 TypeError
// 导致 next build 失败；字体统一由 globals.css 的系统字体栈提供。
import type { ReactNode } from 'react';
// 全局样式：globals.css 提供 Tailwind 指令与基础层 token，其余样式按职责拆分到
// src/styles/*.css。导入顺序即级联顺序，须与拆分前的 globals.css 保持一致。
import './globals.css';
import '../styles/layout.css';
import '../styles/stats.css';
import '../styles/input.css';
import '../styles/output.css';
import '../styles/footer.css';
import '../styles/feedback.css';
import '../styles/hero.css';
import '../styles/seo.css';
import { metadata, viewport, jsonLd } from './(seo)/site-meta';
import GaScripts from './(seo)/ga-scripts';
import { APP_VERSION } from '../config/version';

export { metadata, viewport };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* icon 与 manifest 由 metadata.icons / metadata.manifest 统一输出（v3.18.0 移除手写的重复 link） */}
        <meta name="version" content={APP_VERSION} />
        {/* Google Analytics 4（gtag）：衡量 ID 来自环境变量，缺失/非法时自动跳过注入 */}
        <GaScripts />
      </head>
      <body id="app-body">
        {/* 首屏本地化脚本：在 DOM 解析阶段即按 localStorage 设置 <html> 的 lang / dir / .dark，
            避免 16 语言站刷新后的语言声明错误、RTL 布局跳动与深色模式闪白（T-UI-01/02）。
            script-src 已在 next.config.js 的 CSP 中允许 'unsafe-inline'。 */}
        <script
          dangerouslySetInnerHTML={{ __html: "(function(){try{var d=document.documentElement,l=localStorage.getItem('lang')||'zh-cn';d.lang=l;d.setAttribute('dir',l==='ar'?'rtl':'ltr');var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){d.classList.add('dark');}}catch(e){}})();" }}
        />
        {/* JSON-LD 放在 body 而非显式 <head>：React 19 会 hoist head 内的内联 script，
            hydration 后注入两份重复的结构化数据（v3.18.0 线上实测发现）。 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow">
          跳到主要内容
        </a>
        <div id="app-shell" className="flex min-h-screen flex-col">
          {children}
          {/* 不执行 JavaScript 的抓取器 / 浏览器仍可获得事实文本与可直接订阅的规则文件 */}
          <noscript>
            <div className="seo-noscript" lang="zh-CN">
              <h2>DNS Shield - 路由器级广告过滤规则生成工具</h2>
              <p>
                本站需要 JavaScript 才能生成规则。无需脚本也可直接下载预生成的规则文件：
                <a href="/dnsmasq.conf">dnsmasq.conf</a>、
                <a href="/hosts.txt">hosts.txt</a>、
                <a href="/adguard.txt">adguard.txt</a>、
                <a href="/whitelist.txt">whitelist.txt</a>。
                单一数据源为 <a href="/domains.txt">domains.txt</a>；
                给生成式引擎的站点说明见 <a href="/llms.txt">llms.txt</a>。
              </p>
            </div>
          </noscript>
        </div>
      </body>
    </html>
  );
}
