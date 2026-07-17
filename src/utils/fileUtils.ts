// src/utils/fileUtils.ts v3.4.0

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
