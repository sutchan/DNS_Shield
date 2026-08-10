// src/utils/uiUtils.ts v3.7.16

// 生成行号 - 使用 textContent，避免 XSS 风险和不必要的布局回流
export const generateLineNumbers = (text: string, ref: React.RefObject<HTMLDivElement>): void => {
  if (ref.current) {
    const lineCount = text.split('\n').length;
    // 用数组 join 替代循环字符串拼接，大文本下减少中间字符串分配
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
    // 使用 textContent 代替 innerText，避免触发布局回流，提升性能
    ref.current.textContent = lineNumbers;
  }
};
