// src/utils/parseAggregate.ts v3.16.0
// 多核并行解析的纯函数层：并行度决策、按行边界分片与原始产物聚合。
// parseSource 的逐行收集阶段（collectLines）无跨行状态，按行分片并行求值后
// 聚合原始产物，再统一执行全局后处理（finalizeParsed），结果与单线程
// 整段解析等价（等价契约由 parseAggregate.test.ts 逐字段断言）。

import type { RawCollected, RawCounters } from './parser';

/** 并行解析的行数下限：低于此值单线程更快，不值得池化分发 */
export const PARALLEL_PARSE_THRESHOLD = 20000;

/** 每个分片的最小行数：避免分片过碎导致分发/聚合开销占主导 */
export const MIN_SHARD_LINES = 20000;

/** 并行度上限：超出后收益递减且内存/克隆压力增大 */
export const MAX_SHARDS = 8;

// 并行度决策：min(硬件核心数(钳位 1..8), floor(总行数/每片最小行数))，至少 1。
// hardwareConcurrency 缺失或非法时按 1 核处理（退化为单分片，行为等同串行）。
export const decideShardCount = (totalLines: number, hardwareConcurrency: number): number => {
  if (totalLines < PARALLEL_PARSE_THRESHOLD) return 1;
  const cores = Math.max(1, Math.min(Math.floor(hardwareConcurrency) || 1, MAX_SHARDS));
  return Math.max(1, Math.min(cores, Math.floor(totalLines / MIN_SHARD_LINES)));
};

// 按行边界把文本切为 shardCount 片（行序保持，行数不增不减）。
// shardCount <= 1 时原样返回；以 '\n' 重新拼接全部分片可还原原文。
export const splitIntoShards = (text: string, shardCount: number): string[] => {
  if (shardCount <= 1) return [text];
  const lines = text.split('\n');
  const per = Math.ceil(lines.length / shardCount);
  const shards: string[] = [];
  for (let i = 0; i < lines.length; i += per) {
    shards.push(lines.slice(i, i + per).join('\n'));
  }
  return shards;
};

// 聚合各分片的原始产物与计数器：数组按分片顺序拼接（保持行序）、计数相加。
// 跨分片的去重与白名单剔除不在此处执行，统一交由 finalizeParsed。
export const aggregateRaw = (
  parts: { raw: RawCollected; counters: RawCounters }[]
): { raw: RawCollected; counters: RawCounters } => {
  const raw: RawCollected = { domains: [], whitelist: [], customDns: [], regexRules: [] };
  const counters: RawCounters = { commentCount: 0, invalidCount: 0, totalLines: 0 };
  for (const part of parts) {
    raw.domains.push(...part.raw.domains);
    raw.whitelist.push(...part.raw.whitelist);
    raw.customDns.push(...part.raw.customDns);
    raw.regexRules.push(...part.raw.regexRules);
    counters.commentCount += part.counters.commentCount;
    counters.invalidCount += part.counters.invalidCount;
    counters.totalLines += part.counters.totalLines;
  }
  return { raw, counters };
};
