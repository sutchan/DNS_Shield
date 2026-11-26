// src/utils/lineCount.ts v3.22.3
// 统一的行数统计工具：在 countIterableLines 的共享实现上叠加单槽记忆化。
//
// 背景：同一「文本行数」逻辑此前散落三处（useAsyncRuleProcessing /
// useDomainData / useRuleWorker），其中两处用 text.split('\n').length ——
// 10 万行输入会瞬时分配 10 万元素数组，在主线程上造成可感知卡顿。
// 契约：空串 → 0；其余按 '\n' 分隔的行数（"a\nb" → 2，"a\n" → 2，"\n" → 2）。
//
// v3.22.3：去掉与 iterateLines.ts 重复的 O(n) 扫描循环，直接复用
// countIterableLines；本文件仅保留「同一字符串引用命中即复用」的记忆化语义。
import { countIterableLines } from './iterateLines';

let lastText: string | null = null;
let lastCount = 0;

export const countLines = (text: string): number => {
  if (!text) return 0;
  // 引用相等即同一文本（调用方传递的是同一个 state 值），复用上次结果
  if (text === lastText) return lastCount;
  lastText = text;
  lastCount = countIterableLines(text);
  return lastCount;
};
