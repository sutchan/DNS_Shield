// src/workers/parseShard.worker.ts v3.16.0
// 多核并行解析的分片 Worker：接收一段按行边界切分的文本，执行逐行收集阶段
//（collectLines，无跨行状态），返回原始产物与计数器；跨分片的去重 /
// 白名单剔除黑名单由主线程聚合后统一执行（finalizeParsed），保证并行结果
// 与单线程整段解析逐字节等价（由 parseAggregate.test.ts 断言）。
// 注意：此处刻意不引入 webworker lib（与 dom lib 存在全局类型冲突），
// 仅以最小结构化类型描述 Worker 全局作用域（与 ruleProcessor.worker.ts 一致）。

import { collectLines } from '../utils/parser';
import type { RawCollected, RawCounters } from '../utils/parser';

export interface ParseShardRequest {
  id: number;
  taskId: number;
  shardIndex: number;
  text: string;
}

export type ParseShardResponse =
  | { id: number; taskId: number; shardIndex: number; kind: 'progress'; processed: number; total: number }
  | {
      id: number;
      taskId: number;
      shardIndex: number;
      kind: 'collected';
      raw: RawCollected;
      counters: RawCounters;
      elapsed: number;
    }
  | { id: number; taskId: number; shardIndex: number; kind: 'error'; message: string };

// Worker 全局作用域的最小结构（避免依赖 webworker lib 类型）
interface WorkerScope {
  onmessage: ((event: MessageEvent<ParseShardRequest>) => void) | null;
  postMessage: (message: unknown) => void;
}

const ctx = self as unknown as WorkerScope;

ctx.onmessage = (event: MessageEvent<ParseShardRequest>) => {
  const { id, taskId, shardIndex, text } = event.data;
  const startedAt = Date.now();
  try {
    const { raw, counters } = collectLines(text, (processed, total) => {
      ctx.postMessage({
        id,
        taskId,
        shardIndex,
        kind: 'progress',
        processed,
        total
      } satisfies ParseShardResponse);
    });
    ctx.postMessage({
      id,
      taskId,
      shardIndex,
      kind: 'collected',
      raw,
      counters,
      elapsed: Date.now() - startedAt
    } satisfies ParseShardResponse);
  } catch (error) {
    ctx.postMessage({
      id,
      taskId,
      shardIndex,
      kind: 'error',
      message: error instanceof Error ? error.message : String(error)
    } satisfies ParseShardResponse);
  }
};
