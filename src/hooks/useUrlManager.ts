// src/hooks/useUrlManager.ts v3.7.12
import { useState, useRef } from 'react';
import { fetchFromUrl as fetchFromUrlUtil, fetchFromUrls, isValidHttpUrl, type FetchUrlsResult } from '../utils/fileUtils';
import { generateLineNumbers } from '../utils/uiUtils';
import { config } from '../config/index';
import { useLoading } from './useLoading';

export const useUrlManager = (
  setSourceInput: (value: string) => void,
  parseSourceData: (text?: string) => void,
  showToast: (key: string, params?: { [key: string]: string | number }) => void,
  lineNumbersRef: React.RefObject<HTMLDivElement>
) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState('builtin');
  
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, withLoading } = useLoading(showToast);

  // URL 验证函数
  const validateUrlInput = (): { isValid: boolean; url?: string } => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      showToast('urlEnter');
      return { isValid: false };
    }
    if (!isValidHttpUrl(url)) {
      showToast('invalidUrl');
      return { isValid: false };
    }
    return { isValid: true, url };
  };

  // 加载预设
  const loadPreset = async (preset: string) => {
    setActivePreset(preset);

    await withLoading<string>({
      fetchFn: async () => {
        const url = config.presets[preset as keyof typeof config.presets];
        if (!url) {
          throw new Error('Preset URL not found');
        }
        return fetchFromUrlUtil(url);
      },
      onSuccess: (content: string) => {
        setSourceInput(content);
        parseSourceData(content);
        generateLineNumbers(content, lineNumbersRef);
      },
      errorContext: `loadPreset(${preset})`,
      successToast: { key: 'presetLoaded', params: { preset } },
      errorToast: { key: 'presetFailed' }
    });
  };

  // 从 URL 获取域名（带 URL 验证）
  const fetchFromUrl = async () => {
    await withLoading<string>({
      beforeLoad: () => {
        const { isValid } = validateUrlInput();
        return isValid;
      },
      fetchFn: async () => {
        const { isValid, url } = validateUrlInput();
        if (!isValid || !url) {
          throw new Error('URL not provided');
        }
        return fetchFromUrlUtil(url);
      },
      onSuccess: (content: string) => {
        setSourceInput(content);
        parseSourceData(content);
        generateLineNumbers(content, lineNumbersRef);
      },
      errorContext: 'fetchFromUrl',
      successToast: { key: 'domainsFetched' },
      errorToast: { key: 'fetchFailed' }
    });
  };

  // 添加 URL（带 URL 验证）
  const addUrl = () => {
    const { isValid, url } = validateUrlInput();
    if (!isValid || !url) {
      return;
    }

    setUrls((prev: string[]) => [...prev, url]);
    if (urlInputRef.current) {
      urlInputRef.current.value = '';
    }
    showToast('urlAdded');
  };

  // 排序 URLs
  const sortUrls = () => {
    setUrls((prev: string[]) => [...prev].sort());
    showToast('urlsSorted');
  };

  // 获取全部 URLs（仅处理有效的 HTTP/HTTPS URLs）
  const fetchAllUrls = async () => {
    const validUrls = urls.filter(url => isValidHttpUrl(url));

    if (validUrls.length === 0) {
      showToast('invalidUrl');
      return;
    }

    if (validUrls.length < urls.length) {
      showToast('invalidUrlsFiltered', { count: urls.length - validUrls.length });
    }

    await withLoading<FetchUrlsResult>({
      beforeLoad: () => true,
      loadingToast: { key: 'loading' },
      fetchFn: async () => {
        const result = await fetchFromUrls(validUrls);
        if (result.failedUrls.length > 0) {
          const failedCount = result.failedUrls.length;
          showToast('invalidUrlsFiltered', { count: failedCount });
        }
        return result;
      },
      onSuccess: (result: FetchUrlsResult) => {
        // 全部 URL 失败时 content 为空，避免清空用户已有输入造成数据丢失
        if (result.content.trim() === '' && result.failedUrls.length === validUrls.length) {
          return;
        }
        setSourceInput(result.content);
        parseSourceData(result.content);
        generateLineNumbers(result.content, lineNumbersRef);
      },
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
