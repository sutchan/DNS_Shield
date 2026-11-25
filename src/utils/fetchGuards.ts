// src/utils/fetchGuards.ts v3.22.0
// 出站 fetch 护栏（T-AUD-L02 / T-AUD-M02 共用）：
//   - 体积上限：响应体超 MAX_FETCH_BYTES 即拒绝，避免恶意/失控上游耗尽内存。
//   - 重定向校验：仅允许 https 且落在允许 host 集合内的跳转，防止 SSRF / 出站 host 伪造。
// 纯函数与 IO 分离：这里只做「判定」，实际 fetch/流读取由调用方完成，便于单测。

/** 默认响应体上限（32MB）：足以覆盖公开 hosts/adblock 清单，又不会无限增长 */
export const MAX_FETCH_BYTES = 32 * 1024 * 1024;
/** 最大重定向跳数 */
export const MAX_REDIRECTS = 5;

/** 判定 URL 是否允许出站：协议必须 https，host 必须在白名单内（大小写不敏感）。
 *  host 白名单为空时表示「不限制 host」，仍强制 https。 */
export function isAllowedFetchUrl(rawUrl: string, allowedHosts: ReadonlySet<string>): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') return false;
    if (allowedHosts.size === 0) return true;
    return allowedHosts.has(url.host.toLowerCase());
  } catch {
    return false;
  }
}

/** 从响应头解析 Content-Length；无效/缺失返回 null（交由流式计数兜底）。 */
export function parseContentLength(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** 判定是否超过体积上限：Content-Length 预先拒绝 + 流式累计双重校验。 */
export function exceedsSizeLimit(contentLength: number | null, streamedBytes: number, limit = MAX_FETCH_BYTES): boolean {
  if (contentLength !== null && contentLength > limit) return true;
  return streamedBytes > limit;
}

/** 判定重定向是否允许：跳数未超限、目标 URL 合法且 host 在白名单内。 */
export function isAllowedRedirect(hops: number, location: string, allowedHosts: ReadonlySet<string>): boolean {
  return hops <= MAX_REDIRECTS && isAllowedFetchUrl(location, allowedHosts);
}
