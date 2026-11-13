// src/hooks/useWorkerPool.ts v3.18.1
// 分片解析 Worker 池的主线程控制器（多核并行求值）：
// - 池按需扩展至分片数，分片派发采用最闲优先负载均衡（仅终态消息回收负载）；
// - 收齐全部分片后由 workerPoolFinalize 聚合并统一执行跨行后处理，
//   保证结果与单线程整段解析等价；聚合异常同样结算为 null，杜绝 await 永挂；
// - 任一分片失败 / Worker 崩溃 / postMessage 异常 / 组件卸载时，
//   全部挂起任务以 null 结算，由调用方回退主线程同步路径（T-P1-14 契约）。
'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { logger } from '../utils/logger';
import { splitIntoShards } from '../utils/parseAggregate';
import type { ParseShardResponse } from '../workers/parseShard.worker';
import { finalizeShardResults } from './workerPoolFinalize';
import type { ParallelParseResult, TaskState } from './workerPoolFinalize';
// 保持公开导出契约：聚合结果类型仍从本模块对外暴露
export type { ParallelParseResult } from './workerPoolFinalize';

export const useWorkerPool = () => {
  const workersRef = useRef<Worker[]>([]);
  // 每个 Worker 当前承接的分片数（最闲优先派发的依据）
  const loadRef = useRef<number[]>([]);
  const tasksRef = useRef<Map<number, TaskState>>(new Map());
  const seqRef = useRef(0);
  // 并行解析单飞：避免调用方在引用抖动 / 频繁重渲染时堆积多个并行任务
  // （每个任务都会把整块文本克隆到各 Worker，大输入下将线性放大内存直至 OOM）
  const parallelInflightRef = useRef<{
    text: string;
    taskId: number;
    promise: Promise<ParallelParseResult | null>;
  } | null>(null);

  const terminateAll = useCallback(() => {
    workersRef.current.forEach((worker) => worker.terminate());
    workersRef.current = [];
    loadRef.current = [];
  }, []);

  // 响应路由：中间态 progress 只推进进度；终态 collected/error 回收负载并结算
  const handleResponse = useCallback((workerIndex: number, message: ParseShardResponse) => {
    const task = tasksRef.current.get(message.taskId);
    if (message.kind === 'progress') {
      if (!task) return;
      task.shardProgress.set(message.shardIndex, { processed: message.processed, total: message.total });
      let processed = 0;
      let total = 0;
      task.shardProgress.forEach((shard) => {
        processed += shard.processed;
        total += shard.total;
      });
      task.onProgress?.({ processed, total });
      return;
    }

    // 一个分片派发时 +1，收到终态消息时 -1：progress 属中间态，不能扣减负载，
    // 否则「最闲优先」的计数会被提前清零而失真（一个分片可发多条 progress）。
    loadRef.current[workerIndex] = Math.max(0, (loadRef.current[workerIndex] ?? 1) - 1);
    if (!task) return;

    if (message.kind === 'error') {
      logger.warn('Parse shard task failed:', message.message);
      if (!task.failed) {
        task.failed = true;
        tasksRef.current.delete(message.taskId);
        task.resolve(null);
      }
      return;
    }

    task.collected.set(message.shardIndex, { raw: message.raw, counters: message.counters });
    if (task.collected.size === task.shardTotal && !task.failed) {
      const parts = [...task.collected.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, value]) => value);
      // 聚合与全局后处理统一在纯函数内兜底异常：若先删任务再让异常抛到
      // onmessage，onerror 与卸载 cleanup 都遍历不到它，上层 await 将永挂。
      // 这里无论成功失败都 resolve，失败返回 null 由调用方落回串行路径。
      tasksRef.current.delete(message.taskId);
      task.resolve(finalizeShardResults(parts, task.startedAt));
    }
  }, []);

  // 池按需扩展；创建失败时用现有 worker 兜底（分片会在单 worker 上排队）
  const ensureWorkers = useCallback(
    (size: number): boolean => {
      while (workersRef.current.length < size) {
        try {
          const worker = new Worker(new URL('../workers/parseShard.worker.ts', import.meta.url));
          const index = workersRef.current.length;
          worker.onmessage = (event: MessageEvent<ParseShardResponse>) => handleResponse(index, event.data);
          worker.onerror = (event) => {
            logger.warn('Parse shard worker error:', event.message);
            terminateAll();
            tasksRef.current.forEach((task) => task.resolve(null));
            tasksRef.current.clear();
          };
          workersRef.current.push(worker);
          loadRef.current.push(0);
        } catch (error) {
          logger.warn('Parse shard worker unavailable:', error);
          break;
        }
      }
      return workersRef.current.length > 0;
    },
    [handleResponse, terminateAll]
  );

  // 并行解析入口：分片派发 → 收齐聚合 → finalizeParsed；失败 resolve null
  const runParallel = useCallback(
    (
      text: string,
      shardCount: number,
      onProgress?: (p: { processed: number; total: number }) => void
    ): Promise<ParallelParseResult | null> => {
      // 单飞：同一份文本的重复请求复用进行中的任务，杜绝并发堆积（每个任务都会
      // 把整块文本克隆到各 Worker，大输入下将线性放大内存直至 OOM）；
      // 文本已变化时作废旧任务——其结果已过期，调用方按序号守卫丢弃，
      // 不能让旧文本的解析结果被当作新输入的结果。
      const inflight = parallelInflightRef.current;
      if (inflight) {
        if (inflight.text === text) return inflight.promise;
        const stale = tasksRef.current.get(inflight.taskId);
        if (stale && !stale.failed) {
          stale.failed = true;
          tasksRef.current.delete(inflight.taskId);
          stale.resolve(null);
        }
        parallelInflightRef.current = null;
      }
      // 单分片无并行收益：直接返回 null，由调用方走单 Worker 串行路径
      if (shardCount <= 1) return Promise.resolve(null);
      const shards = splitIntoShards(text, shardCount);
      if (!ensureWorkers(shards.length)) return Promise.resolve(null);
      const taskId = ++seqRef.current;
      const promise = new Promise<ParallelParseResult | null>((resolve) => {
        const task: TaskState = {
          shardTotal: shards.length,
          collected: new Map(),
          shardProgress: new Map(),
          failed: false,
          startedAt: Date.now(),
          resolve,
          onProgress
        };
        tasksRef.current.set(taskId, task);
        for (let shardIndex = 0; shardIndex < shards.length; shardIndex++) {
          // 最闲优先：选当前承接分片数最少的 worker
          let target = 0;
          for (let i = 1; i < loadRef.current.length; i++) {
            if (loadRef.current[i] < loadRef.current[target]) target = i;
          }
          loadRef.current[target]++;
          try {
            workersRef.current[target].postMessage({
              id: taskId * 1000 + shardIndex,
              taskId,
              shardIndex,
              text: shards[shardIndex]
            });
          } catch (error) {
            loadRef.current[target] = Math.max(0, loadRef.current[target] - 1);
            logger.warn('Parse shard postMessage failed:', error);
            if (!task.failed) {
              tasksRef.current.delete(taskId);
              task.resolve(null);
            }
            break;
          }
        }
      });
      parallelInflightRef.current = { text, taskId, promise };
      promise.finally(() => {
        if (parallelInflightRef.current?.promise === promise) parallelInflightRef.current = null;
      }).catch(() => {});
      return promise;
    },
    [ensureWorkers]
  );

  // 卸载：释放全部 Worker 并结算挂起任务，避免调用方 await 永挂（T-P1-14）
  useEffect(() => {
    const tasks = tasksRef.current;
    return () => {
      terminateAll();
      tasks.forEach((task) => task.resolve(null));
      tasks.clear();
    };
  }, [terminateAll]);

  // 池对象必须稳定引用：下游 useDomainData 的 processParseImpl 依赖 [pool]，
  // 引用每帧变化会沿链（processParse → parseSourceData → loadLocalDomains →
  // loadDomainData）引发 useEffect([loadDomainData]) 每帧执行，导致大输入下
  // runParallel 被无限堆积调用（每个克隆整块文本）→ 内存暴涨。memo 切断该链。
  return useMemo(() => ({ runParallel }), [runParallel]);
};
