// src/utils/parseAggregate.test.ts v3.16.0
// 多核并行解析纯函数层的测试：分片不丢行、并行度决策钳位、
// 以及核心契约——「分片收集 + 聚合 + 全局后处理」与单线程整段
// parseSource 的结果完全等价（含跨分片白名单剔除与去重场景）。
import { describe, it, expect } from 'vitest';
import { parseSource, collectLines, finalizeParsed } from './parser';
import {
  decideShardCount,
  splitIntoShards,
  aggregateRaw,
  PARALLEL_PARSE_THRESHOLD,
  MIN_SHARD_LINES,
  MAX_SHARDS
} from './parseAggregate';

describe('decideShardCount', () => {
  it('低于并行阈值时返回 1（不值得池化）', () => {
    expect(decideShardCount(PARALLEL_PARSE_THRESHOLD - 1, 8)).toBe(1);
    expect(decideShardCount(0, 8)).toBe(1);
  });

  it('达到阈值但不足以切出多个满额分片时返回 1', () => {
    expect(decideShardCount(PARALLEL_PARSE_THRESHOLD, 8)).toBe(1);
    expect(decideShardCount(MIN_SHARD_LINES * 2 - 1, 8)).toBe(1);
  });

  it('按核心数与分片下限取最小值', () => {
    // 10 万行 / 每片 2 万 = 5 片，8 核 → 5
    expect(decideShardCount(MIN_SHARD_LINES * 5, 8)).toBe(5);
    // 2 核机器最多 2 片
    expect(decideShardCount(MIN_SHARD_LINES * 5, 2)).toBe(2);
    // 行数充足时受核心数钳位
    expect(decideShardCount(MIN_SHARD_LINES * 50, 4)).toBe(4);
  });

  it('核心数钳位到 1..MAX_SHARDS，非法值按 1 核处理', () => {
    expect(decideShardCount(MIN_SHARD_LINES * 50, 0)).toBe(1);
    expect(decideShardCount(MIN_SHARD_LINES * 50, -2)).toBe(1);
    expect(decideShardCount(MIN_SHARD_LINES * 50, Number.NaN)).toBe(1);
    expect(decideShardCount(MIN_SHARD_LINES * 50, 128)).toBe(MAX_SHARDS);
  });
});

describe('splitIntoShards', () => {
  it('shardCount <= 1 时原样返回', () => {
    const text = 'a.example.com\nb.example.com';
    expect(splitIntoShards(text, 1)).toEqual([text]);
    expect(splitIntoShards(text, 0)).toEqual([text]);
  });

  it('分片不丢行且行序保持，重新拼接可还原原文', () => {
    const text = Array.from({ length: 1001 }, (_, i) => `d${i}.example.com`).join('\n');
    const shards = splitIntoShards(text, 4);
    expect(shards.join('\n')).toBe(text);
    // 每片行数之和等于总行数
    const total = shards.reduce((sum, shard) => sum + shard.split('\n').length, 0);
    expect(total).toBe(1001);
  });

  it('分片数大于行数时不产生空分片', () => {
    const shards = splitIntoShards('a\nb', 8);
    expect(shards).toEqual(['a', 'b']);
  });

  it('结尾换行的文本分片后仍保持行数语义（空行也算一行）', () => {
    const shards = splitIntoShards('a\nb\n', 2);
    expect(shards.join('\n')).toBe('a\nb\n');
  });
});

describe('并行聚合与单线程 parseSource 等价（核心契约）', () => {
  // 覆盖黑名单 / 白名单 / 自定义 DNS / 正则 / 注释 / 空行 / 非法行，
  // 并刻意构造跨分片的白名单剔除与重复域名场景
  const buildSample = (repeat: number): string => {
    const lines: string[] = ['# 头部注释', '', 'ads.example.com', 'tracker.example.net'];
    for (let i = 0; i < repeat; i++) {
      lines.push(`domain-${i}.example.org`);
    }
    // 跨分片重复 + 跨分片被白名单剔除的域名
    lines.push('domain-0.example.org');
    lines.push('@@||domain-1.example.org^');
    lines.push('0.0.0.0 domain-2.example.org');
    lines.push('||regex-blocked.example.com^');
    lines.push('regex:/ads\\d+\\.example\\.com/');
    lines.push('不是合法域名 !!');
    lines.push('# 尾部注释');
    return lines.join('\n');
  };

  const parallelParse = (text: string, shardCount: number) => {
    const parts = splitIntoShards(text, shardCount).map((shard) => collectLines(shard));
    const { raw, counters } = aggregateRaw(parts);
    return finalizeParsed(raw, counters);
  };

  it('分片并行结果与整段解析逐字段等价（2 片）', () => {
    const text = buildSample(30);
    expect(parallelParse(text, 2)).toEqual(parseSource(text));
  });

  it('分片并行结果与整段解析逐字段等价（3 片、跨片重复与剔除）', () => {
    const text = buildSample(97);
    expect(parallelParse(text, 3)).toEqual(parseSource(text));
  });

  it('分片统计计数可加：totalLines 等于总行数', () => {
    const text = buildSample(50);
    const parts = splitIntoShards(text, 4).map((shard) => collectLines(shard));
    const { counters } = aggregateRaw(parts);
    expect(counters.totalLines).toBe(text.split('\n').length);
  });

  it('进度回调：分片尾部补报后各分片 processed 达到各自 total', () => {
    const shards = splitIntoShards(buildSample(60), 2);
    for (const shard of shards) {
      let last: { processed: number; total: number } | null = null;
      collectLines(shard, (processed, total) => {
        last = { processed, total };
      });
      expect(last).toEqual({ processed: shard.split('\n').length, total: shard.split('\n').length });
    }
  });
});
