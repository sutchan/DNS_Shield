// src/hooks/useLineNumbers.ts v3.8.1
// 视图辅助：依据文本内容为行号槽位生成行号。操作 DOM ref，属 UI 层逻辑，
// 故置于 hooks/ 而非纯逻辑 utils/（utils/ 约定不含 React/DOM 依赖）。

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
