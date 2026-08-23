// src/utils/domainFetch.ts v3.8.1
// 从指定 URL 拉取域名文本，带 10s 超时（AbortController）与体积安全上限。
// 流式读取并按累计字节数强制截断（不信任 content-length 头，防 DoS）。
// 返回结构化结果，便于调用方区分「网络错误 / 超时 / 超大 / 空响应」等不同失败原因。

export type FetchErrorType = 'network' | 'timeout' | 'too_large' | 'empty' | 'aborted';

export interface FetchResult {
  ok: boolean;
  text?: string;
  error?: FetchErrorType;
}

export const fetchDomainsText = async (url: string): Promise<FetchResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const MAX_BYTES = 10 * 1024 * 1024;
  try {
    const response = await fetch(url, { signal: controller.signal });
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
      return { ok: true, text };
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
    return { ok: true, text };
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






