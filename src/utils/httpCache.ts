// src/utils/httpCache.ts v3.22.0
// 远程规则源的增量缓存：记录正文 + ETag + 抓取时间，
// 供条件请求（If-None-Match）复用与离线兜底，避免重复下载大体量规则文件。

import { idbGet, idbSet, idbDelete, STORE_HTTP } from './idb';

export interface HttpCacheRecord {
  text: string;
  /** 上次响应的 ETag，无 ETag 时为 null（下次走全量请求） */
  etag: string | null;
  /** 抓取时间戳（毫秒） */
  fetchedAt: number;
}

/** 缓存有效期：超过 7 天视为陈旧，避免离线时无限期使用过期规则源（T-AUD-M03） */
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ETAG_PATTERN = /^(W\/)?"[^"]*"$/;

/** IDB 数据来自用户浏览器，必须运行时校验，不能直接 `as HttpCacheRecord`（T-AUD-M03） */
export const isHttpCacheRecord = (value: unknown): value is HttpCacheRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<HttpCacheRecord>;
  if (typeof record.text !== 'string' || !record.text.trim()) return false;
  if (record.etag !== null && (typeof record.etag !== 'string' || !ETAG_PATTERN.test(record.etag))) return false;
  if (typeof record.fetchedAt !== 'number' || !Number.isFinite(record.fetchedAt)) return false;
  const age = Date.now() - record.fetchedAt;
  return age >= 0 && age <= CACHE_TTL_MS;
};

/** 读取指定 URL 的缓存记录；无缓存、结构非法或已过期时返回 null */
export const getCachedResponse = async (url: string): Promise<HttpCacheRecord | null> => {
  const raw = await idbGet<unknown>(STORE_HTTP, url);
  return isHttpCacheRecord(raw) ? raw : null;
};

/** 写入缓存记录（仅在成功拿到新正文时调用） */
export const putCachedResponse = async (
  url: string,
  text: string,
  etag: string | null
): Promise<boolean> =>
  idbSet(STORE_HTTP, url, { text, etag, fetchedAt: Date.now() } satisfies HttpCacheRecord);

/** 清除指定 URL 的缓存（内容失效或用户主动刷新时使用） */
export const clearCachedResponse = (url: string): Promise<boolean> => idbDelete(STORE_HTTP, url);
