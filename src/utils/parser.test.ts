// src/utils/parser.test.ts v3.9.0
import { describe, it, expect } from 'vitest';
import { parseSource, sortDomains, dedupeDomains } from './parser';

describe('parseSource', () => {
  it('统计黑名单/白名单/注释并去重', () => {
    const input = [
      '# header',
      'ads.example.com',
      'ads.example.com',
      '+white.example.com',
      '@custom.example.com=1.2.3.4',
      '',
      'invalid_domain',
    ].join('\n');

    const { data, stats } = parseSource(input);
    expect(data.domains).toContain('ads.example.com');
    expect(data.whitelist).toEqual(['white.example.com']);
    expect(data.customDns).toEqual([{ domain: 'custom.example.com', ip: '1.2.3.4' }]);
    expect(stats.whitelistCount).toBe(1);
    // invalid_domain 计入 invalidCount（而非被错误统计为注释）
    expect(stats.invalidCount).toBe(1);
  });

  it('白名单域名从黑名单中排除', () => {
    const input = ['dup.example.com', '+dup.example.com'].join('\n');
    const { data } = parseSource(input);
    expect(data.domains).not.toContain('dup.example.com');
    expect(data.whitelist).toContain('dup.example.com');
  });

  it('空输入返回空结果', () => {
    const { data, stats } = parseSource('');
    expect(data.domains).toEqual([]);
    expect(stats.domainCount).toBe(0);
  });

  it('空行不计入注释统计，仅真实注释计入 commentCount', () => {
    const input = [
      '# 真实注释',
      'ads.example.com',
      '',
      '',
      '# 另一注释',
      '  ',
    ].join('\n');
    const { stats } = parseSource(input);
    // 仅 2 行真实注释计入，空行/纯空白行不计入
    expect(stats.commentCount).toBe(2);
    expect(stats.invalidCount).toBe(0);
  });
});

describe('dedupeDomains', () => {
  it('移除重复域名并返回数量', () => {
    const input = ['a.example.com', 'a.example.com', 'b.example.com'].join('\n');
    const { content, removedCount } = dedupeDomains(input);
    expect(removedCount).toBe(1);
    expect(content.split('\n').filter((l) => l === 'a.example.com')).toHaveLength(1);
  });
});

describe('sortDomains', () => {
  it('按域名字母序排列且保留头部注释', () => {
    const input = ['# header', 'c.example.com', 'a.example.com', 'b.example.com'].join('\n');
    const out = sortDomains(input).split('\n');
    expect(out[0]).toBe('# header');
    const domainLines = out.filter((l) => l.endsWith('.example.com'));
    expect(domainLines).toEqual(['a.example.com', 'b.example.com', 'c.example.com']);
  });
});




