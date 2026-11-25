// src/utils/fetchGuards.test.ts v3.22.0
// 出站 fetch 护栏纯函数回归（T-AUD-L02 / T-AUD-M02）。
import { describe, it, expect } from 'vitest';
import {
  MAX_FETCH_BYTES, MAX_REDIRECTS, isAllowedFetchUrl, parseContentLength, exceedsSizeLimit, isAllowedRedirect,
} from './fetchGuards';

const HOSTS = new Set(['raw.githubusercontent.com', 'easylist.to']);

describe('isAllowedFetchUrl', () => {
  it('允许 https 且 host 在白名单内（大小写不敏感）', () => {
    expect(isAllowedFetchUrl('https://raw.githubusercontent.com/a/b', HOSTS)).toBe(true);
    expect(isAllowedFetchUrl('https://EASYLIST.TO/x', HOSTS)).toBe(true);
  });
  it('拒绝 http 与非白名单 host', () => {
    expect(isAllowedFetchUrl('http://raw.githubusercontent.com/a', HOSTS)).toBe(false);
    expect(isAllowedFetchUrl('https://evil.example.com/a', HOSTS)).toBe(false);
  });
  it('拒绝畸形 URL；空白名单时仍强制 https', () => {
    expect(isAllowedFetchUrl('not a url', HOSTS)).toBe(false);
    expect(isAllowedFetchUrl('https://any.example.com', new Set())).toBe(true);
    expect(isAllowedFetchUrl('file:///etc/passwd', new Set())).toBe(false);
  });
});

describe('parseContentLength', () => {
  it('解析合法非负数，拒绝缺失/非法值', () => {
    expect(parseContentLength('1024')).toBe(1024);
    expect(parseContentLength('0')).toBe(0);
    expect(parseContentLength(null)).toBeNull();
    expect(parseContentLength('abc')).toBeNull();
    expect(parseContentLength('-1')).toBeNull();
  });
});

describe('exceedsSizeLimit', () => {
  it('Content-Length 超限预先拒绝；流式累计超限兜底', () => {
    expect(exceedsSizeLimit(MAX_FETCH_BYTES + 1, 0)).toBe(true);
    expect(exceedsSizeLimit(null, MAX_FETCH_BYTES + 1)).toBe(true);
    expect(exceedsSizeLimit(100, 100)).toBe(false);
  });
});

describe('isAllowedRedirect', () => {
  it('跳数超限或目标不合法均拒绝', () => {
    expect(isAllowedRedirect(1, 'https://raw.githubusercontent.com/x', HOSTS)).toBe(true);
    expect(isAllowedRedirect(MAX_REDIRECTS + 1, 'https://raw.githubusercontent.com/x', HOSTS)).toBe(false);
    expect(isAllowedRedirect(0, 'https://evil.example.com', HOSTS)).toBe(false);
    expect(isAllowedRedirect(0, 'http://raw.githubusercontent.com', HOSTS)).toBe(false);
  });
});
