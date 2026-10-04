// src/hooks/useAutosave.ts v3.11.0
// 自动保存编排：挂载时恢复本地草稿（IndexedDB 优先，localStorage 降级），
// 并按固定间隔持久化当前输入。存储读写细节见 autosaveStorage / utils/idb。

'use client';
import { useEffect, type MutableRefObject, type RefObject } from 'react';
import { generateLineNumbers } from './useLineNumbers';
import { readAutosave, readAutosaveTime, writeAutosave } from './autosaveStorage';

/** 自动保存间隔（毫秒） */
const AUTOSAVE_INTERVAL_MS = 30000;

type ToastFn = (key: string, params?: { [key: string]: string | number }) => void;

interface UseAutosaveParams {
  sourceInputRef: MutableRefObject<string>;
  setSourceInput: (value: string) => void;
  parseSourceData: (text?: string) => void;
  lineNumbersRef: RefObject<HTMLDivElement>;
  showToastRef: MutableRefObject<ToastFn>;
  restoredRef: MutableRefObject<boolean>;
}

export const useAutosave = ({
  sourceInputRef,
  setSourceInput,
  parseSourceData,
  lineNumbersRef,
  showToastRef,
  restoredRef
}: UseAutosaveParams) => {
  // 恢复自动保存内容：仅在挂载时执行一次，避免清空后又被覆盖
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (restoredRef.current) return; // 严格单次守卫（StrictMode 双调用亦只执行一次）
    void (async () => {
      const autosave = await readAutosave();
      // 远端加载可能已填充内容，此时不让本地草稿覆盖
      if (!autosave || sourceInputRef.current.trim()) {
        return;
      }
      setSourceInput(autosave);
      parseSourceData(autosave);
      generateLineNumbers(autosave, lineNumbersRef);
      restoredRef.current = true;
      const autoSaveTime = await readAutosaveTime();
      if (autoSaveTime) {
        const timeAgo = Math.floor((Date.now() - autoSaveTime) / 60000);
        if (timeAgo > 0) {
          showToastRef.current('autosaveRestored', { time: timeAgo });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 定时持久化：仅创建一次，通过 ref 读取最新输入
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setInterval(() => {
      if (sourceInputRef.current.trim()) {
        void writeAutosave(sourceInputRef.current);
      }
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
};
