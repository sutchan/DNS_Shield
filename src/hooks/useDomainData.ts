// src/hooks/useDomainData.ts v3.11.0
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithCache } from '../utils/cachedFetch';
import { generateLineNumbers } from './useLineNumbers';
import { ParsedData, Stats } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';
import { isValidAutosave, writeAutosave, clearAutosave } from './autosaveStorage';
import { useAsyncRuleProcessing } from './useAsyncRuleProcessing';
import { useAutosave } from './useAutosave';

export const useDomainData = (showToast: (key: string, params?: { [key: string]: string | number }) => void) => {
  const [sourceInput, setSourceInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData>({
    domains: [],
    whitelist: [],
    customDns: []
  });
  const [stats, setStats] = useState<Stats>({
    domainCount: 0,
    validCount: 0,
    commentCount: 0,
    blacklistCount: 0,
    whitelistCount: 0,
    customDnsCount: 0,
    totalLines: 0,
    invalidCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  // 规则处理：超过阈值的解析/排序/去重移交 Web Worker，避免阻塞主线程
  const { processParse, processSort, processDedupe, progress, isProcessing } =
    useAsyncRuleProcessing();

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const sourceInputRef = useRef(sourceInput);
  sourceInputRef.current = sourceInput;
  // 标记挂载阶段是否已恢复本地自动保存内容：远端加载完成后不应再用远端内容
  // 覆盖用户本地草稿（否则异步返回的远端数据会覆盖刚恢复的 autosave）。
  const autosaveRestoredRef = useRef(false);

  // 大文本经 Web Worker 解析，小文本走主线程同步路径（阈值见 useAsyncRuleProcessing）
  const parseSourceData = useCallback((text?: string) => {
    // 优先使用显式传入的文本；否则读取 ref 中的最新输入，避免闭包依赖 sourceInput
    const input = text ?? sourceInputRef.current;
    void processParse(input)
      .then((outcome) => {
        // outcome 为 null 表示结果已过期或 Worker 不可用，丢弃即可
        if (!outcome) return;
        setParsedData(outcome.data);
        setStats(outcome.stats);
      })
      .catch((error) => {
        logger.error('Error parsing source:', error);
        showToastRef.current('parseFailed');
      });
  }, [processParse]);

  const loadLocalDomains = useCallback(async (text: string) => {
    if (!isValidAutosave(text)) {
      return false;
    }
    if (text.trim()) {
      setSourceInput(text);
      parseSourceData(text);
      generateLineNumbers(text, lineNumbersRef);
      return true;
    }
    return false;
  }, [parseSourceData]);

  // fetchDomainsText 已抽离至 src/utils/domainFetch.ts（流式读取 + 10MB 字节上限，防 DoS）
  const loadDomainData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 若用户已有本地自动保存草稿，则不拉取远端覆盖（优先本地草稿）
      if (autosaveRestoredRef.current && sourceInputRef.current.trim()) {
        return;
      }
      // 优先远端预设源，失败则回退同源 /domains.txt；
      // fetchWithCache 内置 ETag 条件请求（304 复用）与离线缓存兜底
      const remote = await fetchWithCache(config.domainsUrl);
      if (remote && remote.trim()) {
        await loadLocalDomains(remote);
        return;
      }
      const local = await fetchWithCache('/domains.txt');
      if (local && local.trim()) {
        await loadLocalDomains(local);
        return;
      }
      // 所有源均失败且无内容：保留空状态（loadAll 的 finally 会统一处理 UI）
      logger.warn('Could not load any domains source (remote and local both empty).');
    } catch (error) {
      logger.warn('Could not load domains.txt:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadLocalDomains]);

  useEffect(() => {
    loadDomainData();
  }, [loadDomainData]);

  // 自动保存编排：草稿恢复 + 定时持久化（已抽离至 useAutosave）
  useAutosave({
    sourceInputRef,
    setSourceInput,
    parseSourceData,
    lineNumbersRef,
    showToastRef,
    restoredRef: autosaveRestoredRef
  });

  // 防抖解析：用户停止输入 300ms 后再解析，避免频繁计算
  useEffect(() => {
    const timer = setTimeout(() => {
      parseSourceData(sourceInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [sourceInput, parseSourceData]);

  const clearAll = useCallback(() => {
    setSourceInput('');
    setParsedData({ domains: [], whitelist: [], customDns: [] });
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0, customDnsCount: 0, totalLines: 0, invalidCount: 0 });
    // 同步清除本地自动保存与时间戳，避免清空后加载/刷新时旧内容复现
    void clearAutosave();
    showToastRef.current('cleared');
  }, []);

  const sortDomains = useCallback(() => {
    void processSort(sourceInputRef.current).then((sorted) => {
      if (sorted === null) return;
      setSourceInput(sorted);
      parseSourceData(sorted);
      showToastRef.current('domainsSorted');
    });
  }, [processSort, parseSourceData]);

  const dedupeDomains = useCallback(() => {
    void processDedupe(sourceInputRef.current).then((result) => {
      if (!result) return;
      setSourceInput(result.content);
      parseSourceData(result.content);
      showToastRef.current('duplicatesRemoved', { count: result.removedCount });
    });
  }, [processDedupe, parseSourceData]);

  const saveDomains = useCallback(() => {
    if (sourceInputRef.current.trim()) {
      void writeAutosave(sourceInputRef.current);
    }
    showToastRef.current('domainsSaved');
  }, []);

  const handleSourceInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceInput(e.target.value);
    generateLineNumbers(e.target.value, lineNumbersRef);
  }, []);

  return {
    sourceInput,
    parsedData,
    stats,
    setStats,
    isLoading,
    lineNumbersRef,
    parseSourceData,
    clearAll,
    sortDomains,
    dedupeDomains,
    saveDomains,
    handleSourceInput,
    setSourceInput,
    // Worker 处理状态：供 UI 展示进度条与耗时
    progress,
    isProcessing
  };
};
