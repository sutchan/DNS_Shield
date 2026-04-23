// src/hooks/useDomainData.ts v2.2.1
import { useState, useEffect, useRef } from 'react';
import { parseSource, sortDomains as sortDomainsUtil, dedupeDomains as dedupeDomainsUtil } from '../utils/parser';
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
  
  // 引用
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // 加载本地域名数据
  const loadLocalDomains = async () => {
    try {
      console.warn('Loading from local domains.txt');
      const localResponse = await fetch('/domains.txt');
      if (localResponse.ok) {
        const text = await localResponse.text();
        if (text.trim()) {
          setSourceInput(text);
          parseSourceData(text);
          generateLineNumbers(text, lineNumbersRef);
          return true;
        }
      }
      return false;
    } catch (localError) {
      console.warn('Could not load local domains.txt:', localError);
      return false;
    }
  };

  // 加载域名数据的函数
  const loadDomainData = async () => {
    try {
      // 尝试从配置的URL加载
      const response = await fetch(config.domainsUrl);
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          setSourceInput(text);
          parseSourceData(text);
          generateLineNumbers(text, lineNumbersRef);
          return;
        }
      }
      
      // 如果远程加载失败，回退到本地文件
      await loadLocalDomains();
    } catch (error) {
      console.warn('Could not load domains.txt:', error);
      // 发生错误时回退到本地文件
      await loadLocalDomains();
    }
  };

  // 初始化
  useEffect(() => {
    // 加载域名数据
    loadDomainData();
    
    // 确保在客户端环境中使用localStorage
    if (typeof window !== 'undefined') {
      // 加载自动保存
      const autosave = localStorage.getItem('dnsShield_autosave');
      if (autosave && !sourceInput.trim()) {
        setSourceInput(autosave);
        parseSourceData(autosave);
        // 生成自动保存内容的行号
        generateLineNumbers(autosave, lineNumbersRef);
        const autoSaveTime = localStorage.getItem('dnsShield_autosave_time');
        if (autoSaveTime && !isNaN(parseInt(autoSaveTime))) {
          const timeAgo = Math.floor((Date.now() - parseInt(autoSaveTime)) / 60000);
          if (timeAgo > 0) {
            showToast('autosaveRestored', { time: timeAgo });
          }
        }
      }
      
      // 自动保存
      const autoSaveInterval = setInterval(() => {
        if (sourceInput.trim()) {
          localStorage.setItem('dnsShield_autosave', sourceInput);
          localStorage.setItem('dnsShield_autosave_time', Date.now().toString());
        }
      }, 30000);
      
      return () => clearInterval(autoSaveInterval);
    }
  }, []);

  // 监听sourceInput变化，更新输入行号
  useEffect(() => {
    generateLineNumbers(sourceInput, lineNumbersRef);
  }, [sourceInput]);

  // 解析域名数据
  const parseSourceData = (text?: string) => {
    try {
      const input = text || sourceInput;
      const { data, stats: newStats } = parseSource(input);
      setParsedData(data);
      setStats(newStats);
    } catch (error) {
      console.error('Error parsing source:', error);
      showToast('parseFailed');
    }
  };

  // 清空输入
  const clearAll = () => {
    setSourceInput('');
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0 });
  };

  // 排序域名
  const sortDomains = () => {
    const sortedContent = sortDomainsUtil(sourceInput);
    setSourceInput(sortedContent);
    parseSourceData(sortedContent);
    showToast('domainsSorted');
  };

  // 去重域名
  const dedupeDomains = () => {
    const { content, removedCount } = dedupeDomainsUtil(sourceInput);
    setSourceInput(content);
    parseSourceData(content);
    showToast('duplicatesRemoved', { count: removedCount });
  };

  // 保存域名
  const saveDomains = () => {
    // 这里可以实现保存到本地文件的功能
    showToast('domainsSaved');
  };

  // 处理输入变化
  const handleSourceInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceInput(e.target.value);
    parseSourceData(e.target.value);
    generateLineNumbers(e.target.value, lineNumbersRef);
  };

  return {
    sourceInput,
    parsedData,
    stats,
    isLoading,
    lineNumbersRef,
    loadDomainData,
    parseSourceData,
    clearAll,
    sortDomains,
    dedupeDomains,
    saveDomains,
    handleSourceInput,
    setSourceInput
  };
};