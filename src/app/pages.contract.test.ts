// src/app/pages.contract.test.ts v3.22.1
// 页面与关键交互组件的 DOM 契约测试（补齐「页面/组件零测试」盲区）。
// 采用 react-dom/server 静态渲染，无需 @testing-library/react，不改 vitest 收集规则。
// 断言：语义化 id（SPEC §4.4 kebab-case）、标题层级、ARIA 关联、空态/错误态文案。
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Loading from './loading';
import ErrorPage from './error';
import GlobalError from './global-error';
import SeoContent from '../components/SeoContent';

const render = (el: React.ReactElement) => renderToStaticMarkup(el);

describe('路由状态页 DOM 契约', () => {
  it('404 页含语义 id 与返回首页入口（源码契约，next/link 需 Next context）', () => {
    const src = fs.readFileSync(path.join(__dirname, 'not-found.tsx'), 'utf8');
    expect(src).toContain('id="not-found-page"');
    expect(src).toContain('id="not-found-home"');
    expect(src).toContain('href="/"');
  });

  it('加载态含语义 id', () => {
    expect(render(React.createElement(Loading))).toContain('id="route-loading"');
  });

  it('错误页含重试与首页入口、错误摘要槽位', () => {
    const html = render(React.createElement(ErrorPage, { error: new Error('x'), reset: () => {} }));
    expect(html).toContain('id="error-page"');
    expect(html).toContain('id="error-retry"');
    expect(html).toContain('id="error-home"');
  });

  it('全局错误页自带 html/body 与重试入口', () => {
    const html = render(React.createElement(GlobalError, { error: new Error('x'), reset: () => {} }));
    expect(html).toContain('id="global-error-body"');
    expect(html).toContain('id="global-error-retry"');
  });
});

describe('SeoContent 内容与语义契约', () => {
  const html = render(React.createElement(SeoContent));

  it('含 page 内目录与全部锚点目标', () => {
    expect(html).toContain('id="seo-toc"');
    for (const id of ['howto-static', 'about', 'formats-heading', 'deploy-heading', 'faq']) {
      expect(html, `缺少 #${id}`).toContain(`id="${id}"`);
    }
  });

  it('页内目录链接均有对应锚点（无死链）', () => {
    const hrefs = [...html.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThanOrEqual(5);
    for (const href of hrefs) expect(html).toContain(`id="${href}"`);
  });

  it('标题层级从 h2 开始无非预期 h1', () => {
    expect(html).not.toContain('<h1');
    expect(html).toContain('<h2');
  });

  it('FAQ 使用 details/summary 且机器链接包在 nav 内', () => {
    expect(html).toContain('<details');
    expect(html).toContain('<summary>');
    expect(html).toMatch(/<nav[^>]*id="seo-machine-links"[^>]*>/);
  });

  it('可见正文达到 GEO 可引用体量（至少 800 字符）', () => {
    const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    expect(text.length).toBeGreaterThanOrEqual(800);
  });
});
