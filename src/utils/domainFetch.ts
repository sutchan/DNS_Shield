// src/utils/domainFetch.ts v3.11.0
// 从指定 URL 拉取域名文本，带 10s 超时（AbortController）与体积安全上限。
// 流式读取并按累计字节数强制截断（不信任 content-length 头，防 DoS）。
// 支持 ETag 条件请求（If-None-Match）：命中 304 时返回 notModified，由调用方复用缓存正文。
// 返回结构化结果，便于调用方区分「网络错误 / 超时 / 超大 / 空响应 / 未修改」等结果。

export type FetchErrorType = 'network' | 'timeout' | 'too_large' | 'empty' | 'aborted';

export interface FetchResult {
  ok: boolean;
  text?: string;
  error?: FetchErrorType;
  /** 响应 ETag，供下次条件请求复用 */
  etag?: string | null;
  /** 304 未修改：调用方应复用本地缓存正文 */
  notModified?: boolean;
}

export interface FetchOptions {
  /** 上次响应的 ETag，作为 If-None-Match 发送以走 304 增量路径 */
  etag?: string | null;
}

const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 10000;

// 读取 ETag 响应头（防御部分环境/模拟实现缺失 headers）
const readEtag = (response: Response): string | null => {
  try {
    return response.headers?.get('etag') ?? null;
  } catch {
    return null;
  }
};

export const fetchDomainsText = async (
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers: Record<string, string> = {};
  if (options.etag) {
    headers['If-None-Match'] = options.etag;
  }

  try {
    const response = await fetch(url, { signal: controller.signal, headers });
    const etag = readEtag(response);

    // 304：内容未变化，交由调用方复用缓存，避免重复下载
    if (response.status === 304) {
      return { ok: true, notModified: true, etag: etag || options.etag || null };
    }

    if (!response.ok) {
      return { ok: false, error: 'network' };
    }

    // 优先用 content-length 头快速拒绝超大响应
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) {
      return { ok: false, error: 'too_large' };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const text = await response.text();
      if (!text.trim()) return { ok: false, error: 'empty' };
      return { ok: true, text, etag };
    }

    const decoder = new TextDecoder();
    let received = 0;
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        controller.abort();
        return { ok: false, error: 'too_large' };
      }
      text += decoder.decode(value, { stream: true });
    }
    if (!text.trim()) return { ok: false, error: 'empty' };
    return { ok: true, text, etag };
  } catch (err) {
    // AbortController 中止（含超时）会以 AbortError 抛出
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'timeout' };
    }
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timeout);
  }
};
