// src/hooks/useAsyncRuleProcessing.ts v3.15.0
// 统一的规则处理入口：小文本走主线程同步处理（Worker 启动开销大于收益），
// 超过阈值的大文本移交 Web Worker；解析结果以序号守卫丢弃过期响应，
// 避免快速连续输入时旧结果覆盖新输入。

'use client';
import { useCallback, useRef } from 'react';
import {
  parseSource,
  sortDomains as sortDomainsUtil,
  dedupeDomains as dedupeDomainsUtil
} from '../utils/parser';
import { countLines } from '../utils/lineCount';
import { useRuleWorker, WORKER_LINE_THRESHOLD } from './useRuleWorker';
import type { ParsedData } from '../types';
import type { ParseStats } from '../types/formats';

export interface ParseOutcome {
  data: ParsedData;
  stats: ParseStats;
}

export const useAsyncRuleProcessing = () => {
  const { run, progress, isProcessing, isSupported } = useRuleWorker();
  // 解析序号：仅最后一次请求的结果允许落地
  const parseSeqRef = useRef(0);
  // 转换序号（排序/去重共用）：仅最后一次转换请求的结果允许落地，
  // 避免连点两次时旧结果覆盖新结果
  const transformSeqRef = useRef(0);

  const processParse = useCallback(
    async (text: string): Promise<ParseOutcome | null> => {
      const seq = ++parseSeqRef.current;
      // 小文本或 Worker 不可用：主线程同步解析
      if (!isSupported || countLines(text) < WORKER_LINE_THRESHOLD) {
        const outcome = parseSource(text);
        return seq === parseSeqRef.current ? outcome : null;
      }
      const result = await run('parse', text);
      if (result?.kind === 'parsed' && seq === parseSeqRef.current) {
        return { data: result.data, stats: result.stats };
      }
      // 结果已过期：直接丢弃
      if (seq !== parseSeqRef.current) return null;
      // Worker 任务失败（返回空文本兜底）：回退主线程同步解析，
      // 否则解析结果被静默丢弃，预览与输入框内容不一致（T-P1-14）
      const fallback = parseSource(text);
      return seq === parseSeqRef.current ? fallback : null;
    },
    [isSupported, run]
  );

  const processSort = useCallback(
    async (text: string): Promise<string | null> => {
      const seq = ++transformSeqRef.current;
      if (!isSupported || countLines(text) < WORKER_LINE_THRESHOLD) {
        const sorted = sortDomainsUtil(text);
        return seq === transformSeqRef.current ? sorted : null;
      }
      const result = await run('sort', text);
      if (result?.kind !== 'text' || seq !== transformSeqRef.current) return null;
      return result.text;
    },
    [isSupported, run]
  );

  const processDedupe = useCallback(
    async (text: string): Promise<{ content: string; removedCount: number } | null> => {
      const seq = ++transformSeqRef.current;
      if (!isSupported || countLines(text) < WORKER_LINE_THRESHOLD) {
        const deduped = dedupeDomainsUtil(text);
        return seq === transformSeqRef.current ? deduped : null;
      }
      const result = await run('dedupe', text);
      if (result?.kind !== 'text' || seq !== transformSeqRef.current) return null;
      return { content: result.text, removedCount: result.removedCount ?? 0 };
    },
    [isSupported, run]
  );

  return { processParse, processSort, processDedupe, progress, isProcessing };
};
