// src/utils/uiUtils.ts v3.7.7

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
