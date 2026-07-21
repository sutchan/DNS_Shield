// src/utils/fileUtils.ts v3.6.0

const MAX_URL_LENGTH = 2048;
const MAX_FILENAME_LENGTH = 255;
const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export const isValidHttpUrl = (url: string): boolean => {
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

const sanitizeFilename = (filename: string): string => {
  if (!filename) return 'download.txt';
  let safeName = filename.replace(/[\/\\<>:"|?*\x00-\x1f]/g, '_');
  safeName = safeName.replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
  if (!SAFE_FILENAME_PATTERN.test(safeName)) {
    safeName = safeName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
  if (safeName.length > MAX_FILENAME_LENGTH) {
    const extIndex = safeName.lastIndexOf('.');
    if (extIndex > 0) {
      const ext = safeName.substring(extIndex);
      const name = safeName.substring(0, MAX_FILENAME_LENGTH - ext.length);
      safeName = name + ext;
    } else {
      safeName = safeName.substring(0, MAX_FILENAME_LENGTH);
    }
  }
  return safeName || 'download.txt';
};

export const downloadOutput = (content: string, filename: string): void => {
  const safeFilename = sanitizeFilename(filename);
  const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
// 说明：浏览器 CSP 的 connect-src 决定了哪些域名可被 fetch。
// 若目标域名被 CSP 拦截，浏览器会抛出 TypeError（"Failed to fetch"），
// 这里会将其归类为“网络/CSP 拦截”错误，便于给用户可读的提示。
export const fetchFromUrl = async (url: string, timeout = 10000): Promise<string> => {
  if (!isValidHttpUrl(url)) {
    throw new Error(`无效的 URL（仅支持 http/https，且长度 ≤ ${MAX_URL_LENGTH}）：${url}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${response.statusText ? ' ' + response.statusText : ''}`);
    }
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时（>${Math.round(timeout / 1000)}s）`);
    }
    // fetch 在网络失败 / CORS / CSP 拦截时统一抛 TypeError
    if (error instanceof TypeError) {
      throw new Error('网络请求失败：可能是网络不可用、目标站点未开启 CORS，或被内容安全策略(CSP)拦截');
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
