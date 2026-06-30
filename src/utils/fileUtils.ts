// src/utils/fileUtils.ts v2.3.2

// URL 最大长度限制（防止 DoS 攻击）
const MAX_URL_LENGTH = 2048;

// 验证 URL 是否为安全的 HTTP/HTTPS 协议
export const isValidHttpUrl = (url: string): boolean => {
  // 检查 URL 长度
  if (!url || url.length > MAX_URL_LENGTH) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// 下载输出
export const downloadOutput = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 复制到剪贴板
export const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// 从URL获取内容（带超时控制）
export const fetchFromUrl = async (url: string, timeout = 10000): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// 从多个URL获取内容（带超时控制）
export interface FetchUrlsResult {
  content: string;
  failedUrls: { url: string; error: string }[];
}
export const fetchFromUrls = async (urls: string[], timeout = 10000): Promise<FetchUrlsResult> => {
  const failedUrls: { url: string; error: string }[] = [];
  let allContent = '';
  for (const url of urls) {
    try {
      const content = await fetchFromUrl(url, timeout);
      allContent += content + '\n';
    } catch (error) {
      failedUrls.push({
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  return { content: allContent, failedUrls };
};
