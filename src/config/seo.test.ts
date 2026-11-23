// src/config/seo.test.ts v3.20.0
// SEO/GEO 输出回归测试：此前 metadata / JSON-LD / robots / sitemap 零测试覆盖，
// 占位验证值、错误 OG 尺寸、虚假 sitemap 锚点等问题长期未被发现。
// v3.20.0：FAQPage / HowTo 迁至 /about/ 页面级 graph，断言随之拆分。
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { APP_VERSION } from './version';
import { metadata, jsonLd } from '../app/(seo)/site-meta';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { aboutJsonLd } from '../app/(seo)/about-json-ld';
import { GET as llmsGet, dynamic as llmsDynamic } from '../app/llms.txt/route';
import {
  SITE_URL, AI_CRAWLERS, IN_LANGUAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT,
  SITE_LAST_MODIFIED,
} from './site';
import { OUTPUT_FORMATS, FAQ_ITEMS, HOWTO_STEPS, buildLlmsTxt } from './seo-content';

const root = resolve(import.meta.dirname, '..', '..');

describe('metadata', () => {
  it('canonical 指向唯一站点 URL，且不输出指向不存在路由的 hreflang', () => {
    expect(metadata.alternates?.canonical).toBe(SITE_URL);
    expect(metadata.alternates?.languages).toBeUndefined();
  });

  it('标题不嵌版本号，避免发版造成标题漂移', () => {
    const raw = metadata.title;
    const title = raw && typeof raw === 'object' && 'default' in raw ? raw.default : raw;
    expect(title).toBeTruthy();
    expect(String(title)).not.toMatch(/v\d+\.\d+\.\d+/);
  });

  it('未配置环境变量时不输出占位 google-site-verification', () => {
    const value = metadata.verification?.google;
    expect(value).not.toBe('google-site-verification-code');
  });

  it('Open Graph 图片尺寸声明与真实 PNG 完全一致', () => {
    const images = metadata.openGraph?.images;
    const image = Array.isArray(images) && typeof images[0] === 'object' ? images[0] : null;
    expect(image).toBeTruthy();
    expect(image).toMatchObject({ width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT });
    const png = readFileSync(resolve(root, 'public/og-image.png'));
    expect(png.readUInt32BE(16)).toBe(OG_IMAGE_WIDTH);
    expect(png.readUInt32BE(20)).toBe(OG_IMAGE_HEIGHT);
  });
});

describe('JSON-LD @graph', () => {
  const graph = (jsonLd as { '@graph': Array<Record<string, unknown>> })['@graph'];
  const byType = (type: string) => graph.find((node) => node['@type'] === type);
  const aboutGraph = (aboutJsonLd as { '@graph': Array<Record<string, unknown>> })['@graph'];
  const aboutByType = (type: string) => aboutGraph.find((node) => node['@type'] === type);

  it('站点级含 4 类实体且 @id 引用闭环，FAQ/HowTo 已迁出首页', () => {
    expect(graph.map((n) => n['@type'])).toEqual([
      'Organization', 'WebSite', 'WebPage', 'SoftwareApplication',
    ]);
    expect(byType('WebSite')?.publisher).toEqual({ '@id': `${SITE_URL}/#organization` });
    expect(byType('SoftwareApplication')?.publisher).toEqual({ '@id': `${SITE_URL}/#organization` });
    const webpage = byType('WebPage') as Record<string, unknown>;
    expect(webpage.isPartOf).toEqual({ '@id': `${SITE_URL}/#website` });
    expect(webpage.about).toEqual({ '@id': `${SITE_URL}/#software` });
    expect(webpage.hasPart).toBeUndefined();
    // /about/ 页级 graph 独立持有 FAQPage / HowTo / WebPage
    expect(aboutGraph.map((n) => n['@type'])).toEqual(['WebPage', 'FAQPage', 'HowTo']);
  });

  it('inLanguage 覆盖全部 16 种界面语言', () => {
    expect(byType('SoftwareApplication')?.inLanguage).toEqual([...IN_LANGUAGE]);
    expect(byType('WebSite')?.inLanguage).toEqual([...IN_LANGUAGE]);
    expect(aboutByType('FAQPage')?.inLanguage).toBe('zh-CN');
    expect(aboutByType('HowTo')?.inLanguage).toBe('zh-CN');
  });

  it('FAQPage 与 /about/ 页可见 FAQ 逐字一致（防止结构化数据与正文不符）', () => {
    const mainEntity = aboutByType('FAQPage')?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
    expect(mainEntity).toHaveLength(FAQ_ITEMS.length);
    mainEntity.forEach((entry, i) => {
      expect(entry.name).toBe(FAQ_ITEMS[i].q);
      expect(entry.acceptedAnswer.text).toBe(FAQ_ITEMS[i].a);
    });
    expect(aboutByType('FAQPage')?.url).toBe(`${SITE_URL}/about/#faq`);
  });

  it('HowTo 步骤与三步一致，position 从 1 递增，url 指向 /about/ 可见区块', () => {
    const howto = aboutByType('HowTo') as Record<string, unknown>;
    const steps = howto.step as Array<{ position: number; name: string; url: string }>;
    expect(steps).toHaveLength(HOWTO_STEPS.length);
    steps.forEach((step, i) => {
      expect(step.position).toBe(i + 1);
      expect(step.name).toBe(HOWTO_STEPS[i].name);
      expect(step.url).toBe(`${SITE_URL}/about/#howto-static`);
    });
    expect(howto.totalTime).toBe('PT2M');
    expect(Array.isArray(howto.tool)).toBe(true);
    expect((howto.tool as Array<Record<string, unknown>>)[0]['@type']).toBe('HowToTool');
    expect(Array.isArray(howto.supply)).toBe(true);
    expect((howto.supply as Array<Record<string, unknown>>)[0]['@type']).toBe('HowToSupply');
  });
});

describe('robots / sitemap', () => {
  const robotsOutput = robots();

  it('不屏蔽 /_next/（否则 Googlebot 取不到 JS/CSS 无法渲染）', () => {
    const text = JSON.stringify(robotsOutput.rules);
    expect(text).not.toContain('/_next/');
  });

  it('显式 Allow 全部登记的生成式引擎爬虫 UA', () => {
    const text = JSON.stringify(robotsOutput.rules);
    for (const ua of AI_CRAWLERS) expect(text).toContain(ua);
  });

  it('sitemap 只含真实路由（首页 + /about/），无 fragment 伪条目，lastModified 用稳定日期', () => {
    const entries = sitemap();
    expect(entries.map((e) => e.url)).toEqual([`${SITE_URL}/`, `${SITE_URL}/about/`]);
    for (const entry of entries) {
      expect(entry.url).not.toContain('#');
      // 不用每次构建都变的 new Date()，改用手工维护的稳定日期，利于抓取调度
      expect(entry.lastModified).toBe(SITE_LAST_MODIFIED);
    }
  });
});

describe('llms.txt 与可见事实文本', () => {
  const txt = buildLlmsTxt('3.18.0');

  it('注入版本号并列出全部 12 个真实存在的规则文件', () => {
    expect(txt).toContain('v3.18.0');
    for (const f of OUTPUT_FORMATS) {
      expect(txt).toContain(`${SITE_URL}/${f.file}`);
      expect(existsSync(resolve(root, 'public', f.file))).toBe(true);
    }
  });

  it('中英双语 FAQ 与可见 FAQ 同源', () => {
    for (const f of FAQ_ITEMS) {
      expect(txt).toContain(f.q);
      expect(txt).toContain(f.a);
      expect(txt).toContain(f.qEn);
      expect(txt).toContain(f.aEn);
    }
  });

  it('声明隐私边界、机器可读元数据入口与 /about/ 事实页', () => {
    expect(txt).toContain('无需注册');
    expect(txt).toContain(`${SITE_URL}/robots.txt`);
    expect(txt).toContain(`${SITE_URL}/sitemap.xml`);
    expect(txt).toContain(`${SITE_URL}/about/`);
  });

  it('路由以纯文本静态预渲染输出，且注入当前应用版本', async () => {
    expect(llmsDynamic).toBe('force-static');
    const res = llmsGet();
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    const body = await res.text();
    expect(body.startsWith('# DNS Shield')).toBe(true);
    expect(body).toContain(`v${APP_VERSION}`);
    expect(body).toContain('## FAQ (English)');
  });
});
