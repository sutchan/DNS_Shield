// src/utils/lineCount.ts v3.20.1
// 统一的行数统计工具：非分配换行计数，零额外内存开销。
//
// 背景：同一「文本行数」逻辑此前散落三处（useAsyncRuleProcessing /
// useDomainData / useRuleWorker），其中两处用 text.split('\n').length ——
// 10 万行输入会瞬时分配 10 万元素数组，在主线程上造成可感知卡顿。
// 本工具改为按字符扫描计数，结果与 split('\n').length 完全一致。
//
// 契约：空串 → 0；其余按 '\n' 分隔的行数（"a\nb" → 2，"a\n" → 2，"\n" → 2）。
// 纯函数语义（对外结果不变），可在 Worker 与主线程两侧共用。
//
// v3.20.1：单槽记忆化 —— 同一轮输入中 useDomainData / useAsyncRuleProcessing /
// useRuleWorker 三处以相同字符串引用调用 countLines，缓存命中后从 3 次 O(n)
// 降为 1 次（诊断 P2）。仅缓存最近一个字符串，内存开销恒定。
let lastText: string | null = null;
let lastCount = 0;

export const countLines = (text: string): number => {
  if (!text) return 0;
  // 引用相等即同一文本（调用方传递的是同一个 state 值），复用上次结果
  if (text === lastText) return lastCount;
  let count = 1;
  for (let i = 0; i < text.length; i++) {
    // 10 = '\n' 的字符码，避免逐字符字符串比较
    if (text.charCodeAt(i) === 10) count++;
  }
  lastText = text;
  lastCount = count;
  return count;
};
