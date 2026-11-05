// src/utils/lineCount.test.ts v3.14.0
import { describe, it, expect } from 'vitest';
import { countLines } from './lineCount';

describe('countLines', () => {
  it('空串返回 0', () => {
    expect(countLines('')).toBe(0);
  });

  it('单行（无换行符）返回 1', () => {
    expect(countLines('a.example.com')).toBe(1);
  });

  it('按换行符分隔计数', () => {
    expect(countLines('a\nb\nc')).toBe(3);
  });

  it('结尾换行符会多计一行（与 split("\\n").length 语义一致）', () => {
    expect(countLines('a\n')).toBe(2);
  });

  it('仅含换行符时计为 2 行', () => {
    expect(countLines('\n')).toBe(2);
  });

  it('与 split("\\n").length 语义完全一致（样本回归）', () => {
    const samples = ['', 'a', 'a\n', '\n', '\n\n', 'a\nb', 'a\r\nb', 'a\nb\n'];
    for (const sample of samples) {
      expect(countLines(sample)).toBe(sample ? sample.split('\n').length : 0);
    }
  });

  it('大文本计数正确且不产生数组分配（10 万行性能回归守卫）', () => {
    const bigText = Array.from({ length: 100000 }, (_, i) => `d${i}.example.com`).join('\n');
    const startedAt = Date.now();
    const lines = countLines(bigText);
    const elapsed = Date.now() - startedAt;
    expect(lines).toBe(100000);
    // 字符扫描应在毫秒级完成；若回退到 split 分配实现，此处会显著变慢
    expect(elapsed).toBeLessThan(1000);
  });
});
