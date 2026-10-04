// src/utils/cachedFetch.ts v3.11.0
// 带 ETag 增量缓存与离线兜底的规则源拉取，供 useDomainData / useUrlManager 共用：
//   1. 携带上次 ETag 发起条件请求，命中 304 直接复用缓存正文，省流量；
//   2. 200 且非空时写入缓存并返回新正文；
//   3. 网络失败/超限/空响应时回退上次成功缓存，保证离线可用。

import { fetchDomainsText } from './domainFetch';
import { getCachedResponse, putCachedResponse } from './httpCache';

export const fetchWithCache = async (url: string): Promise<string | null> => {
  const cached = await getCachedResponse(url);
  const res = await fetchDomainsText(url, { etag: cached?.etag ?? null });

  // 304 Not Modified：内容未变化，复用缓存正文
  if (res.ok && res.notModified) {
    return cached?.text ?? null;
  }

  if (res.ok && res.text && res.text.trim()) {
    await putCachedResponse(url, res.text, res.etag ?? null);
    return res.text;
  }

  // 拉取失败：回退缓存实现离线可用
  return cached?.text && cached.text.trim() ? cached.text : null;
};
