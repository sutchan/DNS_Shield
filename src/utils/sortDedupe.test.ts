// src/utils/sortDedupe.test.ts v3.7.50
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

  it('同一注释分组下的数据行按归一化域名排序（忽略+/@前缀），注释标题保持原位', () => {
    const input = [
      '# 头部说明',
      'zoo.example.com',
      '+good.example.com',
      'ads.example.com',
      '@cdn.example.com=10.0.0.1',
    ].join('\n');
    const out = sortDomains(input);
    const idx = (s: string) => out.split('\n').indexOf(s);
    // 注释标题保持在该块最前
    expect(idx('# 头部说明')).toBe(0);
    // 块内按 domain 排序（忽略前缀）：ads < cdn < good < zoo
    const ordered = ['ads.example.com', '@cdn.example.com=10.0.0.1', '+good.example.com', 'zoo.example.com'];
    const actual = out.split('\n').slice(1);
    expect(actual).toEqual(ordered);
  });

  it('多个注释分组各自独立排序，块顺序与标题保持不变', () => {
    const input = [
      'b.example.com',
      '# 分组二',
      'y.example.com',
      'x.example.com',
      '# 分组一',
      'm.example.com',
      'a.example.com',
    ].join('\n');
    const out = sortDomains(input);
    const lines = out.split('\n');
    // 无标题的首块排最前
    expect(lines[0]).toBe('b.example.com');
    expect(lines.indexOf('# 分组二')).toBeLessThan(lines.indexOf('x.example.com'));
    expect(lines.indexOf('x.example.com')).toBeLessThan(lines.indexOf('y.example.com'));
    expect(lines.indexOf('# 分组一')).toBeLessThan(lines.indexOf('a.example.com'));
    expect(lines.indexOf('a.example.com')).toBeLessThan(lines.indexOf('m.example.com'));
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
