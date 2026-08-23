// src/utils/domainFetch.test.ts v3.8.0
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchDomainsText } from './domainFetch';

// 构造一个指定长度的文本 body，用于模拟超长响应
const bigText = 'x'.repeat(11 * 1024 * 1024); // 超过 10MB 上限

describe('fetchDomainsText', () => {
  beforeEach(() => {
    vi.stubGlobal('AbortController', class {
      signal = {};
      abort() {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('成功返回文本时 ok=true 且携带 text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('example.com', { status: 200 })
    ));
    const res = await fetchDomainsText('https://example.com/list.txt');
    expect(res.ok).toBe(true);
    expect(res.text).toBe('example.com');
    expect(res.error).toBeUndefined();
  });

  it('空响应返回 ok=false 且 error=empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('', { status: 200 })
    ));
    const res = await fetchDomainsText('https://example.com/empty.txt');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('empty');
  });

  it('超长响应（>10MB）返回 ok=false 且 error=too_large', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(bigText, { status: 200 })
    ));
    const res = await fetchDomainsText('https://example.com/big.txt');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('too_large');
  });

  it('网络错误返回 ok=false 且 error=network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const res = await fetchDomainsText('https://example.com/fail.txt');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('network');
  });
});
