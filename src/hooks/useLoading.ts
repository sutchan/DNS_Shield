// src/hooks/useLoading.ts v3.7.0
// 加载状态管理 hook —— 从 useUrlManager 拆分
import { useState, useCallback } from 'react';

interface LoadConfig<T> {
  fetchFn: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
  successToast?: { key: string; params?: Record<string, string | number> };
  errorToast?: { key: string; params?: Record<string, string | number> };
  loadingToast?: { key: string; params?: Record<string, string | number> };
  beforeLoad?: () => boolean | void;
  errorContext?: string;
}

export const useLoading = (
  showToast: (key: string, params?: { [key: string]: string | number }) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback(async <T>(config: LoadConfig<T>): Promise<void> => {
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

    if (beforeLoad && beforeLoad() === false) {
      return;
    }

    setIsLoading(true);
    if (loadingToast) {
      showToast(loadingToast.key, loadingToast.params);
    }

    try {
      const result = await fetchFn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (successToast) {
        showToast(successToast.key, successToast.params);
      }
    } catch (error) {
      const context = errorContext || 'Loading operation';
      console.error(`[${context}] Error:`, error);
      
      if (onError) {
        onError(error);
      }
      
      if (errorToast) {
        showToast(errorToast.key, errorToast.params);
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return {
    isLoading,
    withLoading
  };
};
