// src/utils/sortDedupe.test.ts v3.7.31
import { describe, it, expect } from 'vitest';
import { sortDomains, dedupeDomains } from './sortDedupe';

describe('sortDomains', () => {
  it('保留表头注释在最前，按字母序排列普通域名', () => {
    const input = ['# header', 'c.example.com', 'a.example.com', 'b.example.com'].join('\n');
    const out = sortDomains(input).split('\n');
    expect(out[0]).toBe('# header');
    const domainLines = out.filter((l) => l.endsWith('.example.com'));
    expect(domainLines).toEqual(['a.example.com', 'b.example.com', 'c.example.com']);
  });

  it('白名单与自定义 DNS 特殊行置于域名之后、注释之前', () => {
    const input = [
      '# 头部说明',
      'ads.example.com',
      '+good.example.com',
      'zoo.example.com',
      '@cdn.example.com=10.0.0.1',
      '# 尾部注释',
    ].join('\n');
    const out = sortDomains(input);
    const idx = (s: string) => out.split('\n').indexOf(s);
    expect(idx('# 头部说明')).toBeLessThan(idx('ads.example.com'));
    expect(idx('zoo.example.com')).toBeLessThan(idx('+good.example.com'));
    expect(idx('+good.example.com')).toBeLessThan(idx('# 尾部注释'));
    expect(idx('@cdn.example.com=10.0.0.1')).toBeLessThan(idx('# 尾部注释'));
  });

  it('空输入返回空字符串', () => {
    expect(sortDomains('')).toBe('');
  });
});

describe('dedupeDomains', () => {
  it('去重普通域名并统计移除数量', () => {
    const input = ['a.example.com', 'a.example.com', 'b.example.com'].join('\n');
    const { content, removedCount } = dedupeDomains(input);
    expect(removedCount).toBe(1);
    expect(content.split('\n').filter((l) => l === 'a.example.com')).toHaveLength(1);
  });

  it('白名单按 +domain 键去重，与普通域名互不冲突', () => {
    const input = ['ad.example.com', '+ad.example.com', '+ad.example.com'].join('\n');
    const { content, removedCount } = dedupeDomains(input);
    expect(removedCount).toBe(1);
    expect(content).toContain('ad.example.com');
    expect(content).toContain('+ad.example.com');
  });

  it('自定义 DNS 按 @domain=ip 整键值去重', () => {
    const input = ['@a.example.com=1.1.1.1', '@a.example.com=1.1.1.1', '@a.example.com=2.2.2.2'].join('\n');
    const { content, removedCount } = dedupeDomains(input);
    expect(removedCount).toBe(1);
    expect(content).toContain('@a.example.com=1.1.1.1');
    expect(content).toContain('@a.example.com=2.2.2.2');
  });

  it('无效行与注释原样保留且不去重（removedCount 仅统计重复域名）', () => {
    const input = ['# 注释', '# 注释', 'not a domain', 'not a domain'].join('\n');
    const { content, removedCount } = dedupeDomains(input);
    // 注释与无效行各自保留，不计入去重统计
    expect(removedCount).toBe(0);
    expect(content.split('\n').filter((l) => l === '# 注释')).toHaveLength(2);
    expect(content.split('\n').filter((l) => l === 'not a domain')).toHaveLength(2);
  });

  it('空输入返回空内容且移除数为 0', () => {
    const { content, removedCount } = dedupeDomains('');
    expect(content).toBe('');
    expect(removedCount).toBe(0);
  });
});
