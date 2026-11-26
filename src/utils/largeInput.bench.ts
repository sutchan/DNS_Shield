// src/utils/largeInput.bench.ts v3.22.4
// T-PERF-01：50MB 级输入基准。文件名非 *.test.ts，不进入默认套件计数；
// 仅由 `npm run benchmark:large` 显式运行，用于防止 reintroduce 全量 split('\n')。
// 采样 heapUsed 峰值并记录耗时，阈值取文本大小的 1.5×（旧实现约 2~3×）。
import { describe, it, expect } from 'vitest';
import { forEachLine, countIterableLines } from './iterateLines';
import { dedupeDomains } from './sortDedupe';
import { splitIntoShards } from './parseAggregate';

const samplePeak = async (work: () => void): Promise<{ peak: number; ms: number }> => {
  let peak = process.memoryUsage().heapUsed;
  const timer = setInterval(() => {
    peak = Math.max(peak, process.memoryUsage().heapUsed);
  }, 10);
  const started = Date.now();
  try {
    work();
    return { peak, ms: Date.now() - started };
  } finally {
    clearInterval(timer);
  }
};

describe('50MB large input benchmark', () => {
  it('逐行迭代 / 分片 / 去重不溢出且峰值受控', async () => {
    // 约 50MB：2.5M 行 × 20 字节
    const text = Array.from({ length: 2_500_000 }, (_, i) => `d${i}.example.com`).join('\n');
    expect(text.length).toBeGreaterThan(45 * 1024 * 1024);
    const before = process.memoryUsage().heapUsed;

    const counted = await samplePeak(() => {
      expect(countIterableLines(text)).toBe(2_500_000);
    });
    const sharded = await samplePeak(() => {
      const parts = splitIntoShards(text, 8);
      expect(parts).toHaveLength(8);
      expect(parts.join('\n')).toBe(text);
    });
    const deduped = await samplePeak(() => {
      expect(dedupeDomains(text).removedCount).toBe(0);
    });

    const worst = Math.max(counted.peak, sharded.peak, deduped.peak) - before;
    expect(worst).toBeLessThan(text.length * 1.5);
    console.log(
      `[benchmark] ${(text.length / 1024 / 1024).toFixed(1)}MB 文本：` +
      `count ${counted.ms}ms / shard ${sharded.ms}ms / dedupe ${deduped.ms}ms，` +
      `峰值增量 ${(worst / 1024 / 1024).toFixed(1)}MB`
    );
  }, 180_000);

  it('forEachLine 与 split 语义在 10 万行样本上一致', () => {
    const text = Array.from({ length: 100_000 }, (_, i) => `d${i}.example.com`).join('\n');
    const viaSplit = text.split('\n');
    const viaIterate: string[] = [];
    forEachLine(text, (line) => viaIterate.push(line));
    expect(viaIterate).toEqual(viaSplit);
  });
});
