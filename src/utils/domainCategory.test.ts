// src/utils/domainCategory.test.ts v3.11.0
import { describe, it, expect } from 'vitest';
import {
  isCategoryKey,
  normalizeCategoryDomain,
  parseCategoryIndex,
  getCategoriesForDomain,
  filterDomainsByCategory,
  countByCategory,
  CATEGORY_DEFINITIONS
} from './domainCategory';

const INDEX_TEXT = [
  '# source domain',
  'adguard ads.example.com',
  'easylist ads.example.com',
  'neohosts track.example.com',
  'stevenblack ads.example.com',
  'unknown-source foo.example.com',
  'youslist track.example.com'
].join('\n');

describe('isCategoryKey', () => {
  it('接受已定义分类，拒绝未知来源', () => {
    expect(isCategoryKey('adguard')).toBe(true);
    expect(isCategoryKey('unknown-source')).toBe(false);
  });
});

describe('normalizeCategoryDomain', () => {
  it('统一小写并去除协议、路径、通配与前导点', () => {
    expect(normalizeCategoryDomain('HTTPS://Ads.Example.com/path')).toBe('ads.example.com');
    expect(normalizeCategoryDomain('*.example.com')).toBe('example.com');
    expect(normalizeCategoryDomain('  .example.com  ')).toBe('example.com');
  });
});

describe('parseCategoryIndex', () => {
  it('解析索引并合并同域名的多来源', () => {
    const index = parseCategoryIndex(INDEX_TEXT);
    const hits = getCategoriesForDomain(index, 'ads.example.com');
    expect(hits.has('adguard')).toBe(true);
    expect(hits.has('easylist')).toBe(true);
    expect(hits.has('stevenblack')).toBe(true);
    expect(hits.size).toBe(3);
  });

  it('忽略注释行与非法来源行', () => {
    const index = parseCategoryIndex(INDEX_TEXT);
    expect(index.has('foo.example.com')).toBe(false);
  });
});

describe('filterDomainsByCategory', () => {
  it('未选择分类时返回全部域名', () => {
    const index = parseCategoryIndex(INDEX_TEXT);
    const domains = ['ads.example.com', 'track.example.com', 'other.example.org'];
    expect(filterDomainsByCategory(domains, index, new Set())).toEqual(domains);
  });

  it('仅保留命中所选分类的域名', () => {
    const index = parseCategoryIndex(INDEX_TEXT);
    const result = filterDomainsByCategory(
      ['ads.example.com', 'track.example.com', 'other.example.org'],
      index,
      new Set(['neohosts'])
    );
    expect(result).toEqual(['track.example.com']);
  });
});

describe('countByCategory', () => {
  it('按真实索引统计各分类域名数', () => {
    const index = parseCategoryIndex(INDEX_TEXT);
    const counts = countByCategory(index);
    expect(counts.adguard).toBe(1);
    expect(counts.easylist).toBe(1);
    expect(counts.neohosts).toBe(1);
    expect(counts.stevenblack).toBe(1);
    expect(counts.youslist).toBe(1);
    expect(Object.keys(counts)).toHaveLength(CATEGORY_DEFINITIONS.length);
  });
});
