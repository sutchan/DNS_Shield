// src/test-utils/domainDataTestKit.ts v3.15.0
// useDomainData 测试套件共享装置：mock 实例与异步辅助函数。
// 为满足单文件 ≤200 行约束，原 useDomainData.test.ts 按关注点拆分为
// parse / sources / actions 三个测试文件，共用本装置。
// vitest.config.ts 已将 src/test-utils 排除出覆盖率统计范围。
import { vi } from 'vitest';
import { act } from 'react';
import { fetchWithCache } from '../utils/cachedFetch';
import { parseSource } from '../utils/parser';
import {
  isValidAutosave,
  writeAutosave,
  clearAutosave,
  readAutosave,
  readAutosaveTime,
} from '../hooks/autosaveStorage';

export const fetchWithCacheMock = vi.mocked(fetchWithCache);
export const parseSourceMock = vi.mocked(parseSource);
export const isValidAutosaveMock = vi.mocked(isValidAutosave);
export const writeAutosaveMock = vi.mocked(writeAutosave);
export const clearAutosaveMock = vi.mocked(clearAutosave);
export const readAutosaveMock = vi.mocked(readAutosave);
export const readAutosaveTimeMock = vi.mocked(readAutosaveTime);

/** 造一份合法草稿（非空字符串），其余一律判为非法 */
export const withValidAutosave = (): void => {
  isValidAutosaveMock.mockImplementation((v): v is string => typeof v === 'string' && v.length > 0);
};

/** 重置全部 mock 并装载默认行为（每个用例前调用） */
export const resetDomainDataMocks = (): void => {
  fetchWithCacheMock.mockReset();
  parseSourceMock.mockClear();
  fetchWithCacheMock.mockResolvedValue(null);
  readAutosaveMock.mockResolvedValue(null);
  readAutosaveTimeMock.mockResolvedValue(null);
  writeAutosaveMock.mockResolvedValue(undefined);
  clearAutosaveMock.mockResolvedValue(undefined);
  withValidAutosave();
};

/** 推进定时器并冲刷微任务（parseSourceData 是 async，需让 promise 链落地） */
export const advance = async (ms: number): Promise<void> => {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
};

/** 仅冲刷微任务，不推进定时器 */
export const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

/** 造 n 行域名文本 */
export const makeLines = (n: number): string =>
  Array.from({ length: n }, (_, i) => `d${i}.example.com`).join('\n');

/** 可手动兑现的 promise：用于精确控制异步恢复与远端加载的先后顺序 */
export function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/** renderHook 暴露的 ref 为只读 RefObject；测试需注入真实 DOM 节点，
 *  故按既有范式断言为可变引用。 */
export const mutableRef = <T,>(ref: { current: T }): { current: T } => ref as { current: T };
