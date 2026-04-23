// src/hooks/useUrlManager.ts v2.2.1
import { useState, useRef } from 'react';
import { fetchFromUrl as fetchFromUrlUtil, fetchFromUrls } from '../utils/fileUtils';
import { generateLineNumbers } from '../utils/uiUtils';
import { config } from '../config';

export const useUrlManager = (
  setSourceInput: (value: string) => void,
  parseSourceData: (text?: string) => void,
  showToast: (key: string, params?: { [key: string]: string | number }) => void,
  lineNumbersRef: React.RefObject<HTMLDivElement>,
  isLangZh: boolean
) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePreset, setActivePreset] = useState('builtin');
  
  // 引用
  const urlInputRef = useRef<HTMLInputElement>(null);

  // 加载预设
  const loadPreset = async (preset: string) => {
    setIsLoading(true);
    setActivePreset(preset);

    try {
      const url = config.presets[preset as keyof typeof config.presets];
      if (!url) {
        return;
      }

      const content = await fetchFromUrlUtil(url);
      setSourceInput(content);
      parseSourceData(content);
      // 生成行号
      generateLineNumbers(content, lineNumbersRef);
      showToast('presetLoaded', { preset });
    } catch (error) {
      console.error('Error loading preset:', error);
      showToast('presetFailed');
    } finally {
      setIsLoading(false);
    }
  };

  // 从 URL 获取域名
  const fetchFromUrl = async () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      showToast('urlEnter');
      return;
    }

    setIsLoading(true);
    try {
      const content = await fetchFromUrlUtil(url);
      setSourceInput(content);
      parseSourceData(content);
      // 生成行号
      generateLineNumbers(content, lineNumbersRef);
      showToast('domainsFetched');
    } catch (error) {
      console.error('Error fetching from URL:', error);
      showToast('fetchFailed');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加 URL
  const addUrl = () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      showToast('urlEnter');
      return;
    }

    setUrls((prev: string[]) => [...prev, url]);
    urlInputRef.current!.value = '';
    showToast('urlAdded');
  };

  // 排序 URLs
  const sortUrls = () => {
    setUrls((prev: string[]) => [...prev].sort());
    showToast('urlsSorted');
  };

  // 获取全部 URLs
  const fetchAllUrls = async () => {
    if (urls.length === 0) {
      showToast('urlListEmpty');
      return;
    }

    setIsLoading(true);
    showToast('loading');
    
    try {
      const allContent = await fetchFromUrls(urls);
      setSourceInput(allContent);
      parseSourceData(allContent);
      // 生成行号
      generateLineNumbers(allContent, lineNumbersRef);
      showToast('urlsFetched');
    } catch (error) {
      console.error('Error fetching all URLs:', error);
      showToast('fetchFailed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    urls,
    isLoading,
    activePreset,
    urlInputRef,
    loadPreset,
    fetchFromUrl,
    addUrl,
    sortUrls,
    fetchAllUrls,
    setUrls
  };
};