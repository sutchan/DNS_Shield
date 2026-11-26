// scripts/lib/aggregateFetch.mjs v3.22.4
// 从 aggregate-upstream.mjs 拆出的上游抓取与域名提取（T-REFACTOR-01）。
// 纯函数 + IO 编排分离；出站护栏复用 src/utils/fetchGuards.ts，杜绝两份实现漂移。
import {
  MAX_FETCH_BYTES, MAX_REDIRECTS, isAllowedFetchUrl, parseContentLength, exceedsSizeLimit, isAllowedRedirect,
} from '../../src/utils/fetchGuards.ts';

/** 从单行规则提取域名（兼容 hosts / adblock / 纯域名 多种格式） */
export function extractDomain(line) {
  const raw = line.trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('!') || raw.startsWith('//')) return null;
  if (raw.startsWith('@@')) return null;
  let candidate = raw;
  const abMatch = candidate.match(/\|\|([a-z0-9-*_.-]+)\^/i);
  if (abMatch) candidate = abMatch[1];
  const hostsMatch = candidate.match(/^\d{1,3}(\.\d{1,3}){3}\s+([a-z0-9-*_.-]+)/i);
  if (hostsMatch) candidate = hostsMatch[2];
  candidate = candidate.split('#')[0].split('!')[0].trim();
  const domain = candidate.replace(/^\*\./, '').toLowerCase();
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) return domain;
  return null;
}

/** 带护栏的文本抓取：逐跳校验 https + host 白名单，流式累计限制体积 */
export async function fetchTextGuarded(url, allowedHosts, timeoutMs) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isAllowedFetchUrl(current, allowedHosts)) throw new Error(`出站 URL 不合法: ${current}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await fetch(current, { signal: controller.signal, redirect: 'manual' });
    } finally {
      clearTimeout(timer);
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const location = new URL(res.headers.get('location'), current).toString();
      if (!isAllowedRedirect(hop, location, allowedHosts)) throw new Error(`重定向被拒绝: ${location}`);
      current = location;
      continue;
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const declared = parseContentLength(res.headers.get('content-length'));
    if (exceedsSizeLimit(declared, 0)) {
      throw new Error(`响应体超过 ${MAX_FETCH_BYTES} 字节上限（Content-Length=${declared}）`);
    }
    if (!res.body) return await res.text();
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (exceedsSizeLimit(null, total)) {
          reader.cancel().catch(() => {});
          throw new Error(`响应体超过 ${MAX_FETCH_BYTES} 字节上限（已读 ${total}）`);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  throw new Error(`重定向次数超过 ${MAX_REDIRECTS}`);
}

export async function fetchDomains(url, allowedHosts, timeoutMs) {
  try {
    const text = await fetchTextGuarded(url, allowedHosts, timeoutMs);
    const set = new Set();
    for (const line of text.split('\n')) {
      const domain = extractDomain(line);
      if (domain) set.add(domain);
    }
    console.log(`  ✓ 提取 ${set.size} 个候选域名: ${url}`);
    return set;
  } catch (err) {
    console.warn(`  ✗ 跳过（${err.message || err.name}）: ${url}`);
    return new Set();
  }
}
