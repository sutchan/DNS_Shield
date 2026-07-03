// src/utils/uiUtils.ts v3.4.0

// 生成行号 - 使用 textContent，避免 XSS 风险和不必要的布局回流
export const generateLineNumbers = (text: string, ref: React.RefObject<HTMLDivElement>): void => {
  if (ref.current) {
    const lineCount = text.split('\n').length;
    let lineNumbers = '';
    for (let i = 1; i <= lineCount; i++) {
      lineNumbers += i + '\n';
    }
    // 使用 textContent 代替 innerText，避免触发布局回流，提升性能
    ref.current.textContent = lineNumbers;
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
