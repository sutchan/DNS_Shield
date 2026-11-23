// src/hooks/useLoading.ts v3.20.1
// 加载状态管理 hook —— 从 useUrlManager 拆分
// v3.20.1：加请求序号守卫，避免多个加载操作并发时旧响应覆盖新输入、
//   以及先完成的请求提前把 isLoading 置 false（诊断 P1-3）。
import { useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

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
  // 每次请求递增序号；只有最后一次请求的结果与状态落地，避免并发串台
  const seqRef = useRef(0);

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

    const seq = ++seqRef.current;
    setIsLoading(true);
    if (loadingToast) {
      showToast(loadingToast.key, loadingToast.params);
    }

    try {
      const result = await fetchFn();
      // 过期请求丢弃：较晚发起的请求已接管，旧结果不得写回状态
      if (seq !== seqRef.current) return;

      if (onSuccess) {
        onSuccess(result);
      }

      if (successToast) {
        showToast(successToast.key, successToast.params);
      }
    } catch (error) {
      // 过期请求的错误也不落地（否则旧请求失败会弹错误 toast 覆盖当前成功态）
      if (seq !== seqRef.current) return;
      const context = errorContext || 'Loading operation';
      logger.error(`[${context}] Error:`, error);

      if (onError) {
        onError(error);
      }

      if (errorToast) {
        showToast(errorToast.key, errorToast.params);
      }
    } finally {
      // 仅最后一次请求负责关闭 loading
      if (seq === seqRef.current) {
        setIsLoading(false);
      }
    }
  }, [showToast]);

  return {
    isLoading,
    withLoading
  };
};
