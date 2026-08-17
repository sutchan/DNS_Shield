// src/hooks/useDomainData.ts v3.7.26
import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSource, sortDomains as sortDomainsUtil, dedupeDomains as dedupeDomainsUtil } from '../utils/parser';
import { fetchDomainsText } from '../utils/domainFetch';
import { generateLineNumbers } from '../utils/uiUtils';
import { ParsedData, Stats } from '../types';
import { config } from '../config';

// 自动保存内容字符上限（与 domainFetch 的 10MB 字节上限同量级，防止 localStorage 脏数据撑爆内存）
const AUTOSAVE_MAX_LENGTH = 5_000_000;

// 校验 localStorage 自动保存内容是否为合法字符串且长度合理，拒绝脏数据
const isValidAutosave = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length <= AUTOSAVE_MAX_LENGTH;
};

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
    invalidCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const sourceInputRef = useRef(sourceInput);
  sourceInputRef.current = sourceInput;
  // 标记挂载阶段是否已恢复本地自动保存内容：远端加载完成后不应再用远端内容
  // 覆盖用户本地草稿（否则异步返回的远端数据会覆盖刚恢复的 autosave）。
  const autosaveRestoredRef = useRef(false);

  const parseSourceData = useCallback((text?: string) => {
    try {
      // 优先使用显式传入的文本；否则读取 ref 中的最新输入，避免闭包依赖 sourceInput
      // （否则 parseSourceData 随 sourceInput 重建会触发 loadDomainData effect 反复执行并覆盖清空）
      const input = text ?? sourceInputRef.current;
      const { data, stats: newStats } = parseSource(input);
      setParsedData(data);
      setStats(newStats);
    } catch (error) {
      console.error('Error parsing source:', error);
      showToastRef.current('parseFailed');
    }
  }, []);

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
      // 优先远端预设源，失败则回退同源 /domains.txt
      const remote = await fetchDomainsText(config.domainsUrl);
      if (remote.ok && remote.text && remote.text.trim()) {
        await loadLocalDomains(remote.text);
        return;
      }
      const local = await fetchDomainsText('/domains.txt');
      if (local.ok && local.text && local.text.trim()) {
        await loadLocalDomains(local.text);
        return;
      }
      // 所有源均失败且无内容：保留空状态（loadAll 的 finally 会统一处理 UI）
      console.warn('Could not load any domains source (remote and local both empty).');
    } catch (error) {
      console.warn('Could not load domains.txt:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadLocalDomains]);

  useEffect(() => {
    loadDomainData();
  }, [loadDomainData]);

  // 恢复自动保存内容（仅在挂载时执行一次，避免清空后又被覆盖）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let autosave: unknown = '';
    try { autosave = localStorage.getItem('dnsShield_autosave'); } catch { /* 隐私模式不可用 */ }
    // schema 校验：仅接受合法字符串且非空，防止脏数据/超长内容进入应用
    if (isValidAutosave(autosave) && !sourceInputRef.current.trim()) {
      setSourceInput(autosave);
      parseSourceData(autosave);
      generateLineNumbers(autosave, lineNumbersRef);
      autosaveRestoredRef.current = true;
      let autoSaveTime = '';
      try { autoSaveTime = localStorage.getItem('dnsShield_autosave_time') ?? ''; } catch { /* 隐私模式不可用 */ }
      if (autoSaveTime && /^\d+$/.test(autoSaveTime)) {
        const timeAgo = Math.floor((Date.now() - parseInt(autoSaveTime)) / 60000);
        if (timeAgo > 0) {
          showToastRef.current('autosaveRestored', { time: timeAgo });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动保存定时器（仅创建一次，通过 ref 读取最新输入）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const autoSaveInterval = setInterval(() => {
      if (sourceInputRef.current.trim()) {
        try {
          localStorage.setItem('dnsShield_autosave', sourceInputRef.current);
          localStorage.setItem('dnsShield_autosave_time', Date.now().toString());
        } catch { /* 隐私模式不可用 */ }
      }
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, []);

  // 防抖解析：用户停止输入 300ms 后再解析，避免频繁计算
  useEffect(() => {
    const timer = setTimeout(() => {
      parseSourceData(sourceInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [sourceInput, parseSourceData]);

  const clearAll = useCallback(() => {
    setSourceInput('');
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0, invalidCount: 0 });
    // 同步清除本地自动保存与时间戳，避免清空后加载/刷新时旧内容复现
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dnsShield_autosave');
        localStorage.removeItem('dnsShield_autosave_time');
      }
    } catch {
      /* localStorage 不可用时忽略 */
    }
    showToastRef.current('cleared');
  }, []);

  const sortDomains = useCallback(() => {
    const sortedContent = sortDomainsUtil(sourceInput);
    setSourceInput(sortedContent);
    parseSourceData(sortedContent);
    showToastRef.current('domainsSorted');
  }, [sourceInput, parseSourceData]);

  const dedupeDomains = useCallback(() => {
    const { content, removedCount } = dedupeDomainsUtil(sourceInput);
    setSourceInput(content);
    parseSourceData(content);
    showToastRef.current('duplicatesRemoved', { count: removedCount });
  }, [sourceInput, parseSourceData]);

  const saveDomains = useCallback(() => {
    if (sourceInputRef.current.trim()) {
      try {
        localStorage.setItem('dnsShield_autosave', sourceInputRef.current);
        localStorage.setItem('dnsShield_autosave_time', Date.now().toString());
      } catch { /* 隐私模式不可用 */ }
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
    isLoading,
    lineNumbersRef,
    parseSourceData,
    clearAll,
    sortDomains,
    dedupeDomains,
    saveDomains,
    handleSourceInput,
    setSourceInput
  };
};




