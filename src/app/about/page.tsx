// src/app/about/page.tsx v3.20.0
// 独立「关于 / FAQ」页面：把原本塞在首页 SeoContent 中的事实文本迁到独立路由。
// Server Component：正文在服务端预渲染进入 HTML，GEO 可抓取性与首页等价；
// 结构化数据（FAQPage / HowTo）随之迁到本页，与可见正文同源，避免首页「有 schema 无正文」。
import type { Metadata } from 'next';
import Link from 'next/link';
import SeoContent from '../../components/SeoContent';
import { ABOUT_ZH } from '../../config/seo-content';
import { SITE_NAME } from '../../config/site';
import { aboutJsonLd } from '../(seo)/about-json-ld';

// 根布局 title.template 会自动追加 `| DNS Shield`，此处只写页面名避免重复
const ABOUT_TITLE = '关于与常见问题';
const ABOUT_DESCRIPTION = ABOUT_ZH.slice(0, 150);

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: '/about/' },
  openGraph: {
    type: 'article',
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: '/about/',
  },
};

export default function AboutPage() {
  return (
    <main className="container about-page" id="main-content">
      {/* 页面级结构化数据：FAQPage / HowTo 与本页可见正文同源（layout 只输出站点级实体） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <header className="about-header">
        <Link href="/" className="about-back" aria-label="返回规则生成器">
          ← 返回工具
        </Link>
        <h1 id="about-page-heading">关于 {SITE_NAME}</h1>
        <p className="about-lead">
          面向搜索引擎与生成式引擎的站点事实页：项目定义、12 种导出格式、使用步骤、部署要点与常见问题。
        </p>
      </header>

      <SeoContent standalone />

      <footer className="about-footer">
        <Link href="/">返回规则生成器 →</Link>
      </footer>
    </main>
  );
}
