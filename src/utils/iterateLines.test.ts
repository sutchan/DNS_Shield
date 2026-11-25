// src/utils/iterateLines.test.ts v3.22.0
// 逐行迭代契约回归（T-PERF-01）：与 split('\n') 行为逐例比对。
import { describe, it, expect } from 'vitest';
import { forEachLine, countIterableLines } from './iterateLines';

const collect = (text: string): string[] => {
  const out: string[] = [];
  forEachLine(text, (line) => out.push(line));
  return out;
};

describe('forEachLine', () => {
  it('与 split("\\n") 逐例一致（含空串、尾随换行、连续换行）', () => {
    const samples = ['', 'a', 'a\nb', 'a\n', '\n', '\n\n', 'a\nb\n', 'a\r\nb', '# c\nx\n\n'];
    for (const s of samples) {
      expect(collect(s)).toEqual(s === '' ? [] : s.split('\n'));
    }
  });
  it('回调收到正确 index', () => {
    const idx: number[] = [];
    forEachLine('a\nb\nc', (_, i) => idx.push(i));
    expect(idx).toEqual([0, 1, 2]);
  });
  it('10 万行迭代不栈溢出且行数正确', () => {
    const text = Array.from({ length: 100000 }, (_, i) => `d${i}.example.com`).join('\n');
    let n = 0;
    forEachLine(text, () => { n++; });
    expect(n).toBe(100000);
  });
});

describe('countIterableLines', () => {
  it('与 split("\\n").length 同契约', () => {
    expect(countIterableLines('')).toBe(0);
    expect(countIterableLines('a')).toBe(1);
    expect(countIterableLines('a\nb')).toBe(2);
    expect(countIterableLines('a\n')).toBe(2);
    expect(countIterableLines('\n')).toBe(2);
  });
});
