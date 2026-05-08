// src/hooks/useDomainData.ts v2.2.6
import { useState, useEffect, useRef, useCallback } from 'react';
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
  
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

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

  const loadDomainData = useCallback(async () => {
    try {
      const response = await fetch(config.domainsUrl);
      if (response.ok) {
        const text = await response.text();
        await loadLocalDomains(text);
        return;
      }
      const localResponse = await fetch('/domains.txt');
      if (localResponse.ok) {
        const text = await localResponse.text();
        await loadLocalDomains(text);
      }
    } catch (error) {
      console.warn('Could not load domains.txt:', error);
      try {
        const localResponse = await fetch('/domains.txt');
        if (localResponse.ok) {
          const text = await localResponse.text();
          await loadLocalDomains(text);
        }
      } catch (localError) {
        console.warn('Could not load local domains.txt:', localError);
      }
    }
  }, [loadLocalDomains]);

  useEffect(() => {
    loadDomainData();
  }, [loadDomainData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const autosave = localStorage.getItem('dnsShield_autosave');
    if (autosave && !sourceInput.trim()) {
      setSourceInput(autosave);
      parseSourceData(autosave);
      generateLineNumbers(autosave, lineNumbersRef);
      const autoSaveTime = localStorage.getItem('dnsShield_autosave_time');
      if (autoSaveTime && /^\d+$/.test(autoSaveTime)) {
        const timeAgo = Math.floor((Date.now() - parseInt(autoSaveTime)) / 60000);
        if (timeAgo > 0) {
          showToastRef.current('autosaveRestored', { time: timeAgo });
        }
      }
    }
    
    const autoSaveInterval = setInterval(() => {
      if (sourceInput.trim()) {
        localStorage.setItem('dnsShield_autosave', sourceInput);
        localStorage.setItem('dnsShield_autosave_time', Date.now().toString());
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [sourceInput, parseSourceData]);

  useEffect(() => {
    generateLineNumbers(sourceInput, lineNumbersRef);
  }, [sourceInput]);

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
    showToastRef.current('domainsSaved');
  }, []);

  const handleSourceInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceInput(e.target.value);
    parseSourceData(e.target.value);
    generateLineNumbers(e.target.value, lineNumbersRef);
  }, [parseSourceData]);

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
