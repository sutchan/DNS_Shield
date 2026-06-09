// src/utils/uiUtils.ts v2.3.0

// 生成行号 - 使用 textContent 代替 innerHTML，避免 XSS 风险
export const generateLineNumbers = (text: string, ref: React.RefObject<HTMLDivElement>): void => {
  if (ref.current) {
    const lineCount = text.split('\n').length;
    const lineNumbers: string[] = [];
    for (let i = 1; i <= lineCount; i++) {
      lineNumbers.push(String(i));
    }
    // 使用 innerText 代替 innerHTML 避免 XSS 风险
    ref.current.innerText = lineNumbers.join('\n');
  }
};

// 同步滚动
export const syncScroll = (textareaRef: React.RefObject<HTMLTextAreaElement>, lineNumbersRef: React.RefObject<HTMLDivElement>): void => {
  if (textareaRef.current && lineNumbersRef.current) {
    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
  }
};

// 同步输出滚动
export const syncOutputScroll = (previewRef: React.RefObject<HTMLDivElement>, lineNumbersRef: React.RefObject<HTMLDivElement>): void => {
  if (previewRef.current && lineNumbersRef.current) {
    lineNumbersRef.current.scrollTop = previewRef.current.scrollTop;
  }
};
