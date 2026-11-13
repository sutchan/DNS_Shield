// src/config/site.ts v3.18.0
// 站点级事实常量单一来源：metadata / robots / sitemap / JSON-LD / llms.txt 共用。
// v3.18.0 前 SITE_URL 在 site-meta.ts、robots.ts、sitemap.ts 各硬编码一份，易漂移。
export const SITE_URL = 'https://dns.ewuse.com';
export const GITHUB_URL = 'https://github.com/sutchan/DNS_Shield';
export const CHANGELOG_URL = `${GITHUB_URL}/blob/main/CHANGELOG.md`;
export const SITE_NAME = 'DNS Shield';

// 社交分享图：1200×630 真实 PNG（v3.18.0 前用 512 图标却声明 1200×630，属无效声明）
export const OG_IMAGE_PATH = '/og-image.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const ICON_512_PATH = '/assets/icons/icon-512x512.png';

/** 站点事实文本最近更新日期；修改 seo-content.ts / site-meta.ts 等 SEO 事实时同步此值 */
export const SITE_LAST_MODIFIED = '2026-11-13';

/** 界面 16 语对应的 BCP 47 标签，与 src/utils/i18n.ts supportedLanguages 一一对应 */
export const IN_LANGUAGE = [
  'zh-CN', 'zh-TW', 'en', 'ar', 'cs', 'es', 'hi', 'id',
  'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi',
] as const;

/**
 * 明确欢迎的生成式引擎 / AI 爬虫 UA。
 * 说明：Google-Extended、Applebot-Extended 只控制训练用途，不影响传统搜索收录；
 * 显式 Allow 是给 LLM 检索与引用（GEO）的明确信号。传统搜索引擎由 userAgent:'*' 覆盖。
 */
export const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
  'meta-externalagent', 'FacebookBot',
  'Bytespider', 'CCBot', 'cohere-ai', 'cohere-training-data-crawler',
  'YouBot', 'Amazonbot', 'Diffbot', 'AI2Bot', 'Webzio-Extended',
] as const;
