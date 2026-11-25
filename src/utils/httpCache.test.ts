// src/utils/httpCache.test.ts v3.22.0
// T-AUD-M03 / T-AUD-M13：缓存层运行时类型守卫与 TTL 回归。
import { describe, it, expect } from 'vitest';
import { CACHE_TTL_MS, isHttpCacheRecord } from './httpCache';

describe('isHttpCacheRecord', () => {
  const valid = { text: 'ads.example.com\n', etag: '"abc123"', fetchedAt: Date.now() };

  it('接受结构合法且在有效期内的记录', () => {
    expect(isHttpCacheRecord(valid)).toBe(true);
    expect(isHttpCacheRecord({ ...valid, etag: null })).toBe(true);
    expect(isHttpCacheRecord({ ...valid, etag: 'W/"abc"' })).toBe(true);
  });

  it('拒绝脏结构、非法 ETag 与超期/未来时间', () => {
    expect(isHttpCacheRecord(null)).toBe(false);
    expect(isHttpCacheRecord({ ...valid, text: 123 })).toBe(false);
    expect(isHttpCacheRecord({ ...valid, text: '   ' })).toBe(false);
    expect(isHttpCacheRecord({ ...valid, etag: 'not-an-etag' })).toBe(false);
    expect(isHttpCacheRecord({ ...valid, fetchedAt: Number.NaN })).toBe(false);
    expect(isHttpCacheRecord({ ...valid, fetchedAt: Date.now() - CACHE_TTL_MS - 1 })).toBe(false);
    expect(isHttpCacheRecord({ ...valid, fetchedAt: Date.now() + 60_000 })).toBe(false);
  });
});
