// src/hooks/useAutosave.ts v3.15.0
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
      if (!autosave) return;
      // 草稿优先：本地自动保存始终优先于远端默认清单。
      // 旧逻辑在「远端先落地」时直接放弃草稿，会造成用户编辑丢失；
      // 现改为无条件恢复草稿，远端加载完成后再由 restoredRef 判定放弃远端内容。
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
  }, [sourceInputRef]);
};
