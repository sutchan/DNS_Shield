// src/test-utils/urlManagerTestKit.ts v3.15.0
// useUrlManager 测试套件共享装置：统一装配 hook 与受控副作用桩。
// 为满足单文件 ≤200 行约束，原 useUrlManager.test.ts 按关注点拆分为
// basic / fetch / preset / batch 四个测试文件，共用本装置。
// vitest.config.ts 已将 src/test-utils 排除出覆盖率统计范围。
import { vi } from 'vitest';
import { renderHook } from './renderHook';
import { useUrlManager } from '../hooks/useUrlManager';

/** 统一装配：注入可控的 setSourceInput / parseSourceData / showToast 与行号 ref */
export function setup() {
  const setSourceInput = vi.fn();
  const parseSourceData = vi.fn();
  const showToast = vi.fn();
  const lineNumbersRef = { current: null as HTMLDivElement | null };

  const hook = renderHook(() =>
    useUrlManager(setSourceInput, parseSourceData, showToast, lineNumbersRef)
  );

  return { ...hook, setSourceInput, parseSourceData, showToast, lineNumbersRef };
}
