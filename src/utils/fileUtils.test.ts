// src/utils/fileUtils.test.ts v3.9.0
import { describe, it, expect, vi, afterEach } from 'vitest';
import { isValidHttpUrl, fetchFromUrl, fetchFromUrls } from './fileUtils';

describe('isValidHttpUrl', () => {
  it('接受 http/https', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com/list.txt')).toBe(true);
  });

  it('拒绝非 http 协议与畸形输入', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
    expect(isValidHttpUrl('')).toBe(false);
  });

  it('拒绝超长 URL', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    expect(isValidHttpUrl(longUrl)).toBe(false);
  });
});

// 用可控制体积的 ReadableStream 模拟响应体（按 64KB 分块写入，避免逐字节过慢）
const makeStreamResponse = (byteLength: number, ok = true): Response => {
  const encoder = new TextEncoder();
  const chunkSize = 64 * 1024;
  const fullChunk = encoder.encode('a'.repeat(chunkSize));
  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= byteLength) {
        controller.close();
        return;
      }
      const remaining = byteLength - sent;
      controller.enqueue(remaining >= chunkSize ? fullChunk : encoder.encode('a'.repeat(remaining)));
      sent += Math.min(chunkSize, remaining);
    },
  });
  return new Response(stream, { status: ok ? 200 : 500 }) as Response;
};

describe('fetchFromUrl 安全与健壮性', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('拒绝非法 URL（非 http/https）', async () => {
    await expect(fetchFromUrl('javascript:alert(1)')).rejects.toThrow(/无效的 URL/);
  });

  it('正常读取小体积响应', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamResponse(50)));
    const text = await fetchFromUrl('https://example.com/list.txt');
    expect(text.length).toBe(50);
  });

  it('超过体积上限时抛错（防大响应 DoS）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamResponse(11 * 1024 * 1024)));
    await expect(fetchFromUrl('https://example.com/huge.txt')).rejects.toThrow(/响应体积超过上限/);
  });

  it('HTTP 非 2xx 时抛错', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamResponse(10, false)));
    await expect(fetchFromUrl('https://example.com/missing.txt')).rejects.toThrow(/HTTP/);
  });
});

describe('fetchFromUrls 并发与容错', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('并发抓取，失败项进入 failedUrls 而不中断整体', async () => {
    const ok = vi.fn().mockImplementation(() => makeStreamResponse(5));
    const bad = vi.fn().mockImplementation(() => makeStreamResponse(11 * 1024 * 1024));
    vi.stubGlobal('fetch', (url: string) => (url.includes('bad') ? bad(url) : ok(url)));
    const result = await fetchFromUrls([
      'https://example.com/a.txt',
      'https://example.com/bad.txt',
      'https://example.com/c.txt',
    ]);
    expect(result.failedUrls).toHaveLength(1);
    expect(result.failedUrls[0].url).toContain('bad');
    expect(result.content).toContain('aaaaa');
  });

  it('全部 URL 失败时 content 为空，failedUrls 与入参等长（供调用方避免清空用户输入）', async () => {
    const bad = vi.fn().mockImplementation(() => makeStreamResponse(11 * 1024 * 1024));
    vi.stubGlobal('fetch', (url: string) => bad(url));
    const urls = ['https://example.com/a.txt', 'https://example.com/b.txt'];
    const result = await fetchFromUrls(urls);
    expect(result.content).toBe('');
    expect(result.failedUrls).toHaveLength(urls.length);
  });
});




