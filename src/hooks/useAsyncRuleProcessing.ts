// src/hooks/useAsyncRuleProcessing.ts v3.11.0
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
import { useRuleWorker, WORKER_LINE_THRESHOLD } from './useRuleWorker';
import type { ParsedData } from '../types';
import type { ParseStats } from '../types/formats';

export interface ParseOutcome {
  data: ParsedData;
  stats: ParseStats;
}

const countLines = (text: string): number => (text ? text.split('\n').length : 0);

export const useAsyncRuleProcessing = () => {
  const { run, progress, isProcessing, isSupported } = useRuleWorker();
  // 解析序号：仅最后一次请求的结果允许落地
  const parseSeqRef = useRef(0);

  const processParse = useCallback(
    async (text: string): Promise<ParseOutcome | null> => {
      const seq = ++parseSeqRef.current;
      // 小文本或 Worker 不可用：主线程同步解析
      if (!isSupported || countLines(text) < WORKER_LINE_THRESHOLD) {
        const outcome = parseSource(text);
        return seq === parseSeqRef.current ? outcome : null;
      }
      const result = await run('parse', text);
      if (result?.kind !== 'parsed' || seq !== parseSeqRef.current) return null;
      return { data: result.data, stats: result.stats };
    },
    [isSupported, run]
  );

  const processSort = useCallback(
    async (text: string): Promise<string | null> => {
      if (!isSupported || countLines(text) < WORKER_LINE_THRESHOLD) {
        return sortDomainsUtil(text);
      }
      const result = await run('sort', text);
      return result?.kind === 'text' ? result.text : null;
    },
    [isSupported, run]
  );

  const processDedupe = useCallback(
    async (text: string): Promise<{ content: string; removedCount: number } | null> => {
      if (!isSupported || countLines(text) < WORKER_LINE_THRESHOLD) {
        return dedupeDomainsUtil(text);
      }
      const result = await run('dedupe', text);
      if (result?.kind !== 'text') return null;
      return { content: result.text, removedCount: result.removedCount ?? 0 };
    },
    [isSupported, run]
  );

  return { processParse, processSort, processDedupe, progress, isProcessing };
};
