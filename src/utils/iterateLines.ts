// src/utils/iterateLines.ts v3.22.3
// 逐行迭代工具（T-PERF-01）：用 indexOf 切片替代 text.split('\n') 的整块数组分配，
// 10 万行级输入可显著降低主线程峰值内存。契约与 split('\n') 完全一致：
//   空串 → 0 行；"a\nb" → 2 行；"a\n" → 2 行；"\n" → 2 行。
// v3.22.3：countIterableLines 成为行数扫描的唯一实现；lineCount.ts 的
// countLines 在本函数上叠加单槽记忆化，二者不再各自维护一份循环。

/** 统计行数（countLines 的记忆化实现复用本函数，契约一致） */
export const countIterableLines = (text: string): number => {
  if (text === '') return 0;
  let count = 1;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) count++;
  }
  return count;
};

/** 逐行回调迭代，不分配整块行数组。
 *  回调签名与 Array.forEach 一致（line, index），返回值被忽略。 */
export const forEachLine = (
  text: string,
  callback: (line: string, index: number) => void
): void => {
  if (text === '') return;
  let start = 0;
  let index = 0;
  for (;;) {
    const nl = text.indexOf('\n', start);
    if (nl === -1) {
      callback(text.slice(start), index);
      return;
    }
    callback(text.slice(start, nl), index++);
    start = nl + 1;
  }
};
