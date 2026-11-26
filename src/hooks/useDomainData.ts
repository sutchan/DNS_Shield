// src/hooks/useDomainData.ts v3.22.4
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateLineNumbers } from './useLineNumbers';
import { ParsedData, Stats } from '../types';
import { logger } from '../utils/logger';
import { writeAutosave, clearAutosave } from './autosaveStorage';
import { useAsyncRuleProcessing } from './useAsyncRuleProcessing';
import { WORKER_LINE_THRESHOLD } from './useRuleWorker';
import { countLines } from '../utils/lineCount';
import { useAutosave } from './useAutosave';
import { useDomainSources } from './useDomainData.sources';

export const useDomainData = (showToast: (key: string, params?: { [key: string]: string | number }) => void) => {
  const [sourceInput, setSourceInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData>({
    domains: [],
    whitelist: [],
    customDns: [],
    regexRules: []
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
  // T-AUD-L05：标记「用户真实编辑」而非被动填充（远端加载也走 setSourceInput，
  // 不能用 sourceInputRef 是否非空判断，否则远端先落地时草稿无法优先恢复）。
  const userEditedRef = useRef(false);

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

  // 源加载编排（远端优先 + 本地回退 + 草稿保护）已拆至 useDomainData.sources
  const { isLoading } = useDomainSources({
    setSourceInput,
    parseSourceData,
    lineNumbersRef,
    sourceInputRef,
    autosaveRestoredRef,
    showToastRef,
  });

  // 自动保存编排：草稿恢复 + 定时持久化（已抽离至 useAutosave）
  useAutosave({
    sourceInputRef,
    setSourceInput,
    parseSourceData,
    lineNumbersRef,
    showToastRef,
    restoredRef: autosaveRestoredRef,
    userEditedRef,
  });

  // 防抖解析：小文本（低于 Worker 阈值）立即解析以保持预览实时性；
  // 大文本保留 300ms 防抖，避免每次按键都触发 Worker 计算（T-P1-05）
  useEffect(() => {
    // 仅计数换行数判断规模，避免每次按键都 split 分配整块数组阻塞主线程
    // （10 万行级输入下，split 会瞬时分配巨大数组并拖慢输入响应）。
    // 计数逻辑统一收敛到 utils/lineCount（T-P1-08），与 Worker 侧同源同实现。
    const isLarge = countLines(sourceInput) >= WORKER_LINE_THRESHOLD;
    const timer = setTimeout(() => {
      parseSourceData(sourceInput);
    }, isLarge ? 300 : 0);
    return () => clearTimeout(timer);
  }, [sourceInput, parseSourceData]);

  const clearAll = useCallback(() => {
    setSourceInput('');
    setParsedData({ domains: [], whitelist: [], customDns: [], regexRules: [] });
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0, customDnsCount: 0, totalLines: 0, invalidCount: 0 });
    // 同步清除本地自动保存与时间戳，避免清空后加载/刷新时旧内容复现
    void clearAutosave();
    showToastRef.current('cleared');
  }, []);

  const sortDomains = useCallback(() => {
    const snapshot = sourceInputRef.current;
    void processSort(snapshot).then((sorted) => {
      if (sorted === null) return;
      // 处理期间用户继续输入时，不得用「点击瞬间」的旧文本覆盖新内容（T-P1-15）
      if (sourceInputRef.current !== snapshot) return;
      setSourceInput(sorted);
      parseSourceData(sorted);
      showToastRef.current('domainsSorted');
    }).catch((error) => logger.error('Error sorting domains:', error));
  }, [processSort, parseSourceData]);

  const dedupeDomains = useCallback(() => {
    const snapshot = sourceInputRef.current;
    void processDedupe(snapshot).then((result) => {
      if (!result) return;
      // 同上：用户已修改输入则放弃本次去重结果
      if (sourceInputRef.current !== snapshot) return;
      setSourceInput(result.content);
      parseSourceData(result.content);
      showToastRef.current('duplicatesRemoved', { count: result.removedCount });
    }).catch((error) => logger.error('Error deduping domains:', error));
  }, [processDedupe, parseSourceData]);

  const saveDomains = useCallback(() => {
    const text = sourceInputRef.current;
    if (!text.trim()) {
      showToastRef.current('domainsSaved');
      return;
    }
    // 写入结果必须反馈给用户：双通道都失败时不得显示「已保存」（T-AUD-H04）
    void writeAutosave(text).then((result) => {
      if (result.ok) {
        showToastRef.current('domainsSaved');
        return;
      }
      logger.warn('Manual save failed:', result.reason);
      showToastRef.current('autosaveFailed');
    });
  }, []);

  const handleSourceInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    userEditedRef.current = true;
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
