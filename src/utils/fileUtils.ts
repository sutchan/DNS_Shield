// src/utils/fileUtils.ts v2.2.5

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

// 从URL获取内容
export const fetchFromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
};

// 从多个URL获取内容
export const fetchFromUrls = async (urls: string[]): Promise<string> => {
  let allContent = '';
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        allContent += await response.text() + '\n';
      }
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
    }
  }
  return allContent;
};