// src/hooks/useUrlManager.ts v3.9.0
import { useState, useCallback } from 'react';
import { fetchFromUrl as fetchFromUrlUtil, fetchFromUrls, isValidHttpUrl, type FetchUrlsResult } from '../utils/fileUtils';
import { fetchDomainsText } from '../utils/domainFetch';
import { generateLineNumbers } from './useLineNumbers';
import { config, presetMirrors, type PresetName } from '../config/index';
import { useLoading } from './useLoading';

export const useUrlManager = (
  setSourceInput: (value: string) => void,
  parseSourceData: (text?: string) => void,
  showToast: (key: string, params?: { [key: string]: string | number }) => void,
  lineNumbersRef: React.RefObject<HTMLDivElement>
) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState('builtin');
  // 受控 URL 输入框状态：避免非受控 defaultValue 导致清空/回显不同步
  const [urlInput, setUrlInput] = useState(config.domainsUrl);

  const { isLoading, withLoading } = useLoading(showToast);

  // URL 验证函数（从受控状态读取）
  const validateUrlInput = useCallback((): { isValid: boolean; url?: string } => {
    const url = urlInput.trim();
    if (!url) {
      showToast('urlEnter');
      return { isValid: false };
    }
    if (!isValidHttpUrl(url)) {
      showToast('invalidUrl');
      return { isValid: false };
    }
    return { isValid: true, url };
  }, [urlInput, showToast]);

  // 加载预设（多镜像降级：主源失败时自动尝试后续镜像）
  const loadPreset = useCallback(async (preset: string) => {
    setActivePreset(preset);

    await withLoading<string>({
      fetchFn: async () => {
        const mirrors = presetMirrors[preset as PresetName];
        if (!mirrors) {
          throw new Error('Preset not found');
        }
        // 依次尝试各镜像，返回第一个成功获取的文本内容
        for (const url of mirrors) {
          const res = await fetchDomainsText(url);
          if (res.ok && res.text) {
            return res.text;
          }
        }
        throw new Error('All preset mirrors failed');
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
  }, [setSourceInput, parseSourceData, lineNumbersRef, withLoading]);

  // 从 URL 获取域名（带 URL 验证）
  const fetchFromUrl = useCallback(async () => {
    await withLoading<string>({
      beforeLoad: () => {
        const { isValid } = validateUrlInput();
        return isValid;
      },
      fetchFn: async () => {
        // beforeLoad 已校验通过，直接取受控值，避免二次校验重复 toast
        const url = urlInput.trim();
        if (!url) {
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
  }, [urlInput, validateUrlInput, setSourceInput, parseSourceData, lineNumbersRef, withLoading]);

  // 添加 URL（带 URL 验证）
  const addUrl = useCallback(() => {
    const { isValid, url } = validateUrlInput();
    if (!isValid || !url) {
      return;
    }

    setUrls((prev: string[]) => [...prev, url]);
    setUrlInput('');
    showToast('urlAdded');
  }, [validateUrlInput, setUrls, setUrlInput, showToast]);

  // 排序 URLs
  const sortUrls = useCallback(() => {
    setUrls((prev: string[]) => [...prev].sort());
    showToast('urlsSorted');
  }, [setUrls, showToast]);

  // 获取全部 URLs（仅处理有效的 HTTP/HTTPS URLs）
  const fetchAllUrls = useCallback(async () => {
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
  }, [urls, setSourceInput, parseSourceData, lineNumbersRef, withLoading, showToast]);

  return {
    urls,
    isLoading,
    activePreset,
    urlInput,
    setUrlInput,
    loadPreset,
    fetchFromUrl,
    addUrl,
    sortUrls,
    fetchAllUrls,
    setUrls
  };
};



