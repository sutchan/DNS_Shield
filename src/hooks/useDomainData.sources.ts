// src/hooks/useDomainData.sources.ts v3.22.4
// 从 useDomainData.ts 拆出的远端/本地域名源加载编排（T-REFACTOR-01）。
// 保持原有行为：远端预设优先、本地 /domains.txt 回退、草稿优先保护与用户可见失败提示。
import { useCallback, useEffect, useState } from 'react';
import type * as React from 'react';
import { fetchWithCache } from '../utils/cachedFetch';
import { generateLineNumbers } from './useLineNumbers';
import { config } from '../config';
import { logger } from '../utils/logger';
import { isValidAutosave } from './autosaveStorage';

type ShowToast = (key: string, params?: { [key: string]: string | number }) => void;

interface DomainSourceArgs {
  setSourceInput: React.Dispatch<React.SetStateAction<string>>;
  parseSourceData: (text?: string) => void;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  sourceInputRef: React.MutableRefObject<string>;
  autosaveRestoredRef: React.MutableRefObject<boolean>;
  showToastRef: React.MutableRefObject<ShowToast>;
}

export const useDomainSources = ({
  setSourceInput,
  parseSourceData,
  lineNumbersRef,
  sourceInputRef,
  autosaveRestoredRef,
  showToastRef,
}: DomainSourceArgs) => {
  const [isLoading, setIsLoading] = useState(false);

  const loadLocalDomains = useCallback(async (text: string) => {
    if (!isValidAutosave(text)) return false;
    if (text.trim()) {
      setSourceInput(text);
      parseSourceData(text);
      generateLineNumbers(text, lineNumbersRef);
      return true;
    }
    return false;
  }, [parseSourceData, setSourceInput, lineNumbersRef]);

  const loadDomainData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 网络往返期间本地草稿可能已恢复：此时放弃远端内容，避免覆盖用户草稿（T-P1-11）
      const remote = await fetchWithCache(config.domainsUrl);
      if (autosaveRestoredRef.current && sourceInputRef.current.trim()) return;
      if (remote && remote.trim()) {
        await loadLocalDomains(remote);
        return;
      }
      const local = await fetchWithCache('/domains.txt');
      if (local && local.trim()) {
        await loadLocalDomains(local);
        return;
      }
      logger.warn('Could not load any domains source (remote and local both empty).');
      showToastRef.current('domainsLoadFailed');
    } catch (error) {
      logger.warn('Could not load domains.txt:', error);
      showToastRef.current('domainsLoadFailed');
    } finally {
      setIsLoading(false);
    }
  }, [loadLocalDomains, autosaveRestoredRef, sourceInputRef, showToastRef]);

  useEffect(() => {
    loadDomainData();
  }, [loadDomainData]);

  return { isLoading };
};
