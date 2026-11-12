// src/app/sitemap.ts v3.18.0
// 本站是单页应用：/#generator、/#rules、/#faq 这类带 fragment 的 URL 在 sitemap 中
// 会被搜索引擎归一化为 "/"，属于无效/重复条目（v3.18.0 前存在 4 条，其中 3 条是锚点）。
// lastModified 也不再使用每次构建都会变的 new Date()：不准确的时间戳会误导抓取调度。
import type { MetadataRoute } from 'next';
import { SITE_URL } from '../config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
