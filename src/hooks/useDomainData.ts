// src/hooks/useDomainData.ts v3.7.16
import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSource, sortDomains as sortDomainsUtil, dedupeDomains as dedupeDomainsUtil } from '../utils/parser';
import { fetchDomainsText } from '../utils/domainFetch';
import { generateLineNumbers } from '../utils/uiUtils';
import { ParsedData, Stats } from '../types';
import { config } from '../config';

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
    whitelistCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const sourceInputRef = useRef(sourceInput);
  sourceInputRef.current = sourceInput;

  const parseSourceData = useCallback((text?: string) => {
    try {
      const input = text || sourceInput;
      const { data, stats: newStats } = parseSource(input);
      setParsedData(data);
      setStats(newStats);
    } catch (error) {
      console.error('Error parsing source:', error);
      showToastRef.current('parseFailed');
    }
  }, [sourceInput]);

  const loadLocalDomains = useCallback(async (text: string) => {
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
      // 优先远端预设源，失败则回退同源 /domains.txt
      const remote = await fetchDomainsText(config.domainsUrl);
      if (remote && remote.trim()) {
        await loadLocalDomains(remote);
        return;
      }
      const local = await fetchDomainsText('/domains.txt');
      if (local && local.trim()) {
        await loadLocalDomains(local);
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
    let autosave = '';
    try { autosave = localStorage.getItem('dnsShield_autosave') ?? ''; } catch { /* 隐私模式不可用 */ }
    if (autosave && !sourceInputRef.current.trim()) {
      setSourceInput(autosave);
      parseSourceData(autosave);
      generateLineNumbers(autosave, lineNumbersRef);
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
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0 });
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
