// src/config/seo.test.ts v3.18.0
// SEO/GEO 输出回归测试：此前 metadata / JSON-LD / robots / sitemap 零测试覆盖，
// 占位验证值、错误 OG 尺寸、虚假 sitemap 锚点等问题长期未被发现。
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { APP_VERSION } from './version';
import { metadata, jsonLd } from '../app/(seo)/site-meta';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { GET as llmsGet, dynamic as llmsDynamic } from '../app/llms.txt/route';
import {
  SITE_URL, AI_CRAWLERS, IN_LANGUAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT,
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

  it('包含 5 类实体且 @id 引用闭环', () => {
    expect(graph.map((n) => n['@type'])).toEqual([
      'Organization', 'WebSite', 'SoftwareApplication', 'FAQPage', 'HowTo',
    ]);
    expect(byType('WebSite')?.publisher).toEqual({ '@id': `${SITE_URL}/#organization` });
    expect(byType('SoftwareApplication')?.publisher).toEqual({ '@id': `${SITE_URL}/#organization` });
  });

  it('inLanguage 覆盖全部 16 种界面语言', () => {
    expect(byType('SoftwareApplication')?.inLanguage).toEqual([...IN_LANGUAGE]);
    expect(byType('WebSite')?.inLanguage).toEqual([...IN_LANGUAGE]);
  });

  it('FAQPage 与页面可见 FAQ 逐字一致（防止结构化数据与正文不符）', () => {
    const mainEntity = byType('FAQPage')?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
    expect(mainEntity).toHaveLength(FAQ_ITEMS.length);
    mainEntity.forEach((entry, i) => {
      expect(entry.name).toBe(FAQ_ITEMS[i].q);
      expect(entry.acceptedAnswer.text).toBe(FAQ_ITEMS[i].a);
    });
  });

  it('HowTo 步骤与快速入门三步一致，position 从 1 递增', () => {
    const steps = byType('HowTo')?.step as Array<{ position: number; name: string }>;
    expect(steps).toHaveLength(HOWTO_STEPS.length);
    steps.forEach((step, i) => {
      expect(step.position).toBe(i + 1);
      expect(step.name).toBe(HOWTO_STEPS[i].name);
    });
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

  it('sitemap 只含唯一有效 URL，无 fragment 伪条目与动态时间戳', () => {
    const entries = sitemap();
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe(SITE_URL);
    expect(entries[0].url).not.toContain('#');
    expect(entries[0].lastModified).toBeUndefined();
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

  it('声明隐私边界与机器可读元数据入口', () => {
    expect(txt).toContain('无需注册');
    expect(txt).toContain(`${SITE_URL}/robots.txt`);
    expect(txt).toContain(`${SITE_URL}/sitemap.xml`);
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
