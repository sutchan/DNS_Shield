// src/utils/domainFetch.ts v3.7.21
// 从指定 URL 拉取域名文本，带 10s 超时（AbortController）与体积安全上限。
// 流式读取并按累计字节数强制截断（不信任 content-length 头，防 DoS）。

export const fetchDomainsText = async (url: string): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const MAX_BYTES = 10 * 1024 * 1024;
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    // 优先用 content-length 头快速拒绝超大响应
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) return null;
    const reader = response.body?.getReader();
    if (!reader) return await response.text();
    const decoder = new TextDecoder();
    let received = 0;
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        controller.abort();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};




