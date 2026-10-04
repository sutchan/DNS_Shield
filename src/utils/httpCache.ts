// src/utils/httpCache.ts v3.11.0
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

/** 读取指定 URL 的缓存记录；无缓存或不可用时返回 null */
export const getCachedResponse = (url: string): Promise<HttpCacheRecord | null> =>
  idbGet<HttpCacheRecord>(STORE_HTTP, url);

/** 写入缓存记录（仅在成功拿到新正文时调用） */
export const putCachedResponse = async (
  url: string,
  text: string,
  etag: string | null
): Promise<boolean> =>
  idbSet(STORE_HTTP, url, { text, etag, fetchedAt: Date.now() } satisfies HttpCacheRecord);

/** 清除指定 URL 的缓存（内容失效或用户主动刷新时使用） */
export const clearCachedResponse = (url: string): Promise<boolean> => idbDelete(STORE_HTTP, url);
