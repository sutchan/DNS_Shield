// src/hooks/useLineNumbers.ts v3.15.0
// 视图辅助：依据文本内容为行号槽位生成行号。操作 DOM ref，属 UI 层逻辑，
// 故置于 hooks/ 而非纯逻辑 utils/（utils/ 约定不含 React/DOM 依赖）。
import { countLines } from '../utils/lineCount';

// 记录各行号槽位已渲染的行数：行数未变时无需重建文本内容，
// 避免在超长文本中编辑时每次按键都生成数十万字符（T-P2-01）。
const renderedLineCounts = new WeakMap<HTMLElement, number>();

// 生成行号 - 使用 textContent，避免 XSS 风险和不必要的布局回流
export const generateLineNumbers = (text: string, ref: React.RefObject<HTMLDivElement>): void => {
  const el = ref.current;
  if (!el) return;
  // 与既有实现保持一致：空文本同样显示 1 行行号
  const lineCount = Math.max(countLines(text), 1);
  // 行数未变化时跳过重绘（用户在同一行内编辑的常见场景）
  if (renderedLineCounts.get(el) === lineCount) return;
  renderedLineCounts.set(el, lineCount);
  // 直接拼接字符串，避免 Array.from 分配 N 元素中间数组
  let lineNumbers = '';
  for (let i = 1; i <= lineCount; i += 1) {
    lineNumbers += i;
    if (i < lineCount) lineNumbers += '\n';
  }
  // 使用 textContent 代替 innerText，避免触发布局回流，提升性能
  el.textContent = lineNumbers;
};
