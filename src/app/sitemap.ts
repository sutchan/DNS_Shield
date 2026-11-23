// src/app/sitemap.ts v3.20.0
// v3.20.0：事实文本迁至 /about/ 独立页，sitemap 增加该真实路由（无 fragment）。
// 本站主流程仍是单页应用：/#generator、/#rules、/#faq 这类带 fragment 的 URL 在 sitemap 中
// 会被搜索引擎归一化为 "/"，属于无效/重复条目（v3.18.0 前存在 4 条，其中 3 条是锚点）。
// lastModified 不使用每次构建都会变的 new Date()（误导性时间戳会扰乱抓取调度），
// 改用 src/config/site.ts 的 SITE_LAST_MODIFIED——仅在事实文案实际变更时手工更新，稳定且准确。
import type { MetadataRoute } from 'next';
import { SITE_URL, SITE_LAST_MODIFIED } from '../config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // trailingSlash: true 的规范形式是带尾斜杠的根 URL，与 canonical 输出保持一致
      url: `${SITE_URL}/`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      // 独立事实页（关于 / 使用步骤 / 部署 / 12 格式 / FAQ），正文服务端预渲染
      url: `${SITE_URL}/about/`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
