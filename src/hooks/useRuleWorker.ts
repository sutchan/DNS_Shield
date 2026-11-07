// src/hooks/useRuleWorker.ts v3.16.0
// 规则处理 Worker 的主线程控制器：负责 Worker 生命周期、请求/响应配对、
// 进度回调与耗时统计。不支持 Worker 的环境（SSR / 老旧浏览器）返回 null，
// 由调用方回退主线程同步处理，保证功能不中断。
// v3.16.0：parse 任务行数达到 PARALLEL_PARSE_THRESHOLD 时改走分片 Worker 池
// 多核并行求值（useWorkerPool），失败自动落回单 Worker 串行路径。

'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';
import { countLines } from '../utils/lineCount';
import { decideShardCount, PARALLEL_PARSE_THRESHOLD } from '../utils/parseAggregate';
import type { ParsedData } from '../types';
import type { ParseStats } from '../types/formats';
import type { RuleWorkerResponse, RuleWorkerTask } from '../workers/ruleProcessor.worker';
import { useWorkerPool } from './useWorkerPool';

/** 超过该行数才移交 Worker：低于此规模同步解析更快，避免 Worker 启动开销 */
export const WORKER_LINE_THRESHOLD = 5000;

export type RuleWorkerResult =
  | { kind: 'parsed'; data: ParsedData; stats: ParseStats; elapsed: number }
  | { kind: 'text'; text: string; removedCount?: number; elapsed: number };

export interface RuleProgress {
  processed: number;
  total: number;
  /** 处理耗时（毫秒）；任务进行中为 null，完成后写入 */
  elapsed: number | null;
}

interface PendingTask {
  resolve: (value: RuleWorkerResult) => void;
  onProgress?: (progress: { processed: number; total: number }) => void;
}

export const useRuleWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  // 分片 Worker 池：超大文本 parse 任务的多核并行求值（v3.16.0）
  const pool = useWorkerPool();
  const pendingRef = useRef<Map<number, PendingTask>>(new Map());
  const seqRef = useRef(0);
  const [isSupported] = useState(
    () => typeof window !== 'undefined' && typeof Worker !== 'undefined'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<RuleProgress | null>(null);

  // 惰性创建并复用 Worker；创建失败返回 null，调用方回退同步路径
  const ensureWorker = useCallback((): Worker | null => {
    if (!isSupported) return null;
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL('../workers/ruleProcessor.worker.ts', import.meta.url));
      worker.onmessage = (event: MessageEvent<RuleWorkerResponse>) => {
        const message = event.data;
        const pending = pendingRef.current.get(message.id);
        if (message.kind === 'progress') {
          pending?.onProgress?.({ processed: message.processed, total: message.total });
          return;
        }
        if (!pending) return;
        pendingRef.current.delete(message.id);
        setIsProcessing(pendingRef.current.size > 0);
        if (message.kind === 'error') {
          logger.warn('Rule worker task failed:', message.message);
          // 以空结果回退，由调用方走主线程同步路径兜底
          pending.resolve({ kind: 'text', text: '', elapsed: 0 });
          return;
        }
        setProgress((prev) => ({
          processed: prev?.total ?? 0,
          total: prev?.total ?? 0,
          elapsed: message.elapsed
        }));
        pending.resolve(message);
      };
      worker.onerror = (event) => {
        logger.warn('Rule worker error:', event.message);
        // Worker 崩溃：释放挂起任务与实例，下次调用重新创建
        pendingRef.current.forEach((p) => p.resolve({ kind: 'text', text: '', elapsed: 0 }));
        pendingRef.current.clear();
        setIsProcessing(false);
        worker.terminate();
        workerRef.current = null;
      };
      workerRef.current = worker;
      return worker;
    } catch (error) {
      logger.warn('Rule worker unavailable, fallback to main thread:', error);
      return null;
    }
  }, [isSupported]);

  // 卸载时释放 Worker 与挂起任务
  useEffect(() => {
    // 在 effect 体内取出挂起表引用：cleanup 阶段直接用 ref.current 会被
    // react-hooks/exhaustive-deps 判定为「清理时可能已变化」的值
    const pendingTasks = pendingRef.current;
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      // 释放挂起任务：必须 resolve，否则调用方的 await 永挂、进度条永久卡死（T-P1-14）
      pendingTasks.forEach((p) => p.resolve({ kind: 'text', text: '', elapsed: 0 }));
      pendingTasks.clear();
    };
  }, []);

  const run = useCallback(
    async (task: RuleWorkerTask, text: string): Promise<RuleWorkerResult | null> => {
      // 多核并行分支（v3.16.0）：超大文本按行分片派发多个 Worker 求值，
      // 各分片仅执行无跨行状态的逐行收集，主线程聚合后统一执行跨行
      // 去重 / 白名单剔除（finalizeParsed），结果与串行路径等价。
      if (task === 'parse' && countLines(text) >= PARALLEL_PARSE_THRESHOLD) {
        const cores =
          typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1;
        const parallel = await pool.runParallel(
          text,
          decideShardCount(countLines(text), cores),
          (p) => setProgress({ processed: p.processed, total: p.total, elapsed: null })
        );
        if (parallel) {
          setProgress({
            processed: parallel.stats.totalLines,
            total: parallel.stats.totalLines,
            elapsed: parallel.elapsed
          });
          setIsProcessing(pendingRef.current.size > 0);
          return {
            kind: 'parsed',
            data: parallel.data,
            stats: parallel.stats,
            elapsed: parallel.elapsed
          };
        }
        // 并行失败（Worker 不可用 / 分片失败）：落回下方单 Worker 串行路径兜底
      }
      const worker = ensureWorker();
      // Worker 不可用：返回 null，由调用方回退同步处理
      if (!worker) return Promise.resolve(null);
      const id = ++seqRef.current;
      return new Promise<RuleWorkerResult>((resolve) => {
        // 关键修复：必须透传 onProgress，否则 Worker 的 progress 消息（每 2000 行上报）
        // 在 onmessage 中被静默丢弃，进度条始终停留在 0%。完成分支基于本条任务的真实
        // total（prev.total 由 onProgress 持续写入）收尾为 100%。
        pendingRef.current.set(id, {
          resolve,
          onProgress: (p) => setProgress({ processed: p.processed, total: p.total, elapsed: null }),
        });
        setIsProcessing(true);
        // 进度总数用非分配换行计数（T-P1-08），避免大文本每次任务都分配整块数组
        setProgress({ processed: 0, total: countLines(text), elapsed: null });
        try {
          worker.postMessage({ id, task, text });
        } catch (error) {
          // postMessage 失败（如数据不可结构化克隆）：立即结算该任务，
          // 否则 Promise 永挂、进度条常驻（T-P1-14）
          pendingRef.current.delete(id);
          setIsProcessing(pendingRef.current.size > 0);
          logger.warn('Rule worker postMessage failed:', error);
          resolve({ kind: 'text', text: '', elapsed: 0 });
        }
      });
    },
    [ensureWorker, pool]
  );

  return { run, progress, isProcessing, isSupported };
};
