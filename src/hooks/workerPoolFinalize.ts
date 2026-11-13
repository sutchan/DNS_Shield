// src/hooks/workerPoolFinalize.ts v3.18.1
// 并行分片的聚合收尾：把「按分片序拼接 → 全局跨行后处理」收敛为可单测的纯函数，
// 并统一承接聚合异常，避免 useWorkerPool 中先删除任务再聚合导致 Promise 永挂。

import { logger } from '../utils/logger';
import { aggregateRaw } from '../utils/parseAggregate';
import { finalizeParsed } from '../utils/parser';
import type { RawCollected, RawCounters } from '../utils/parser';
import type { ParsedData } from '../types';
import type { ParseStats } from '../types/formats';

export interface ParallelParseResult {
  data: ParsedData;
  stats: ParseStats;
  elapsed: number;
}

export interface ShardResult {
  raw: RawCollected;
  counters: RawCounters;
}

/** 主线程侧挂起任务的状态；类型与聚合逻辑同处一模块，避免控制器文件膨胀 */
export interface TaskState {
  shardTotal: number;
  collected: Map<number, ShardResult>;
  shardProgress: Map<number, { processed: number; total: number }>;
  failed: boolean;
  startedAt: number;
  resolve: (value: ParallelParseResult | null) => void;
  onProgress?: (p: { processed: number; total: number }) => void;
}

/**
 * 聚合全部分片并执行只跑一次的全局后处理（去重 / 白名单剔除）。
 * 任何异常都返回 null，由调用方落回单 Worker 串行路径；绝不向外抛出，
 * 否则挂在 onmessage 里的任务已不在 tasksRef，onerror 与卸载清理都无法结算它。
 */
export const finalizeShardResults = (
  parts: ShardResult[],
  startedAt: number
): ParallelParseResult | null => {
  try {
    const { raw, counters } = aggregateRaw(parts);
    const { data, stats } = finalizeParsed(raw, counters);
    return { data, stats, elapsed: Date.now() - startedAt };
  } catch (error) {
    logger.warn('Parallel parse aggregation failed, fallback to serial path:', error);
    return null;
  }
};
