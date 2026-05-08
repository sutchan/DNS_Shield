// src/hooks/useUrlManager.ts v2.2.6
import { useState, useRef } from 'react';
import { fetchFromUrl as fetchFromUrlUtil, fetchFromUrls } from '../utils/fileUtils';
import { generateLineNumbers } from '../utils/uiUtils';
import { config } from '../config/index';

interface LoadConfig {
  fetchFn: () => Promise<string>;
  onSuccess?: (content: string) => void;
  onError?: (error: unknown) => void;
  successToast?: { key: string; params?: Record<string, string | number> };
  errorToast?: { key: string; params?: Record<string, string | number> };
  loadingToast?: { key: string; params?: Record<string, string | number> };
  beforeLoad?: () => boolean | void;
  errorContext?: string;
}

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

  // 通用的加载包装函数
  const withLoading = async (config: LoadConfig): Promise<void> => {
    const {
      fetchFn,
      onSuccess,
      onError,
      successToast,
      errorToast,
      loadingToast,
      beforeLoad,
      errorContext
    } = config;

    // 执行前置检查
    if (beforeLoad && beforeLoad() === false) {
      return;
    }

    setIsLoading(true);
    if (loadingToast) {
      showToast(loadingToast.key, loadingToast.params);
    }

    try {
      const content = await fetchFn();
      
      // 更新状态
      setSourceInput(content);
      parseSourceData(content);
      generateLineNumbers(content, lineNumbersRef);
      
      // 执行自定义成功回调
      if (onSuccess) {
        onSuccess(content);
      }
      
      // 显示成功提示
      if (successToast) {
        showToast(successToast.key, successToast.params);
      }
    } catch (error) {
      const context = errorContext || 'Loading operation';
      console.error(`[${context}] Error:`, error);
      
      // 执行自定义错误回调
      if (onError) {
        onError(error);
      }
      
      // 显示错误提示
      if (errorToast) {
        showToast(errorToast.key, errorToast.params);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 加载预设
  const loadPreset = async (preset: string) => {
    setActivePreset(preset);

    await withLoading({
      fetchFn: async () => {
        const url = config.presets[preset as keyof typeof config.presets];
        if (!url) {
          throw new Error('Preset URL not found');
        }
        return fetchFromUrlUtil(url);
      },
      errorContext: `loadPreset(${preset})`,
      successToast: { key: 'presetLoaded', params: { preset } },
      errorToast: { key: 'presetFailed' }
    });
  };

  // 从 URL 获取域名
  const fetchFromUrl = async () => {
    await withLoading({
      beforeLoad: () => {
        const url = urlInputRef.current?.value.trim();
        if (!url) {
          showToast('urlEnter');
          return false;
        }
        return true;
      },
      fetchFn: async () => {
        const url = urlInputRef.current?.value.trim();
        if (!url) {
          throw new Error('URL not provided');
        }
        return fetchFromUrlUtil(url);
      },
      errorContext: 'fetchFromUrl',
      successToast: { key: 'domainsFetched' },
      errorToast: { key: 'fetchFailed' }
    });
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
    await withLoading({
      beforeLoad: () => {
        if (urls.length === 0) {
          showToast('urlListEmpty');
          return false;
        }
        return true;
      },
      loadingToast: { key: 'loading' },
      fetchFn: () => fetchFromUrls(urls),
      errorContext: 'fetchAllUrls',
      successToast: { key: 'urlsFetched' },
      errorToast: { key: 'fetchFailed' }
    });
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