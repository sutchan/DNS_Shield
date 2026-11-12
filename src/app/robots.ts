// src/app/robots.ts v3.18.0
// v3.18.0：① 移除 Disallow: /_next/ —— 它会阻断 Googlebot 抓取 JS/CSS，
// 导致依赖客户端渲染的页面无法被正确渲染与索引；本站无 /_next/ 需要屏蔽的内容。
// ② 显式列出并 Allow 主流生成式引擎 / AI 爬虫 UA，给出明确的 GEO 准入信号。
import type { MetadataRoute } from 'next';
import { SITE_URL, AI_CRAWLERS } from '../config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: [...AI_CRAWLERS], allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
