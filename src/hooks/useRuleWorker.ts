// src/hooks/useRuleWorker.ts v3.11.1
// 规则处理 Worker 的主线程控制器：负责 Worker 生命周期、请求/响应配对、
// 进度回调与耗时统计。不支持 Worker 的环境（SSR / 老旧浏览器）返回 null，
// 由调用方回退主线程同步处理，保证功能不中断。

'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';
import type { ParsedData } from '../types';
import type { ParseStats } from '../types/formats';
import type { RuleWorkerResponse, RuleWorkerTask } from '../workers/ruleProcessor.worker';

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
      pendingTasks.clear();
    };
  }, []);

  const run = useCallback(
    (task: RuleWorkerTask, text: string): Promise<RuleWorkerResult | null> => {
      const worker = ensureWorker();
      // Worker 不可用：返回 null，由调用方回退同步处理
      if (!worker) return Promise.resolve(null);
      const id = ++seqRef.current;
      return new Promise<RuleWorkerResult>((resolve) => {
        pendingRef.current.set(id, { resolve });
        setIsProcessing(true);
        setProgress({ processed: 0, total: text.split('\n').length, elapsed: null });
        worker.postMessage({ id, task, text });
      });
    },
    [ensureWorker]
  );

  return { run, progress, isProcessing, isSupported };
};
