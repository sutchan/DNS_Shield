// src/hooks/useDomainData.parse.test.ts v3.15.0
// @vitest-environment jsdom
// 解析编排契约（T-P1-05）：小文本（低于 Worker 阈值）立即解析以保预览实时；
// 大文本走 300ms 防抖，避免每次按键都触发重计算；阈值边界行为明确。
// 本仓 jsdom 不提供 Worker / IndexedDB，故实际覆盖 useRuleWorker 的主线程回退路径。
// （原 useDomainData.test.ts 按关注点拆分，本文件承接「防抖解析」分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import { WORKER_LINE_THRESHOLD } from './useRuleWorker';
import {
  fetchWithCacheMock,
  parseSourceMock,
  resetDomainDataMocks,
  advance,
  makeLines,
} from '../test-utils/domainDataTestKit';

vi.mock('../utils/cachedFetch', () => ({
  fetchWithCache: vi.fn()
}));

vi.mock('./autosaveStorage', () => ({
  isValidAutosave: vi.fn(),
  writeAutosave: vi.fn(),
  clearAutosave: vi.fn(),
  readAutosave: vi.fn(),
  readAutosaveTime: vi.fn()
}));

vi.mock('../utils/parser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/parser')>();
  return { ...actual, parseSource: vi.fn(actual.parseSource) };
});

beforeEach(() => {
  vi.useFakeTimers();
  resetDomainDataMocks();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('useDomainData · 防抖解析（T-P1-05）', () => {
  it('挂载时状态为空，且远端加载失败时保留空状态', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('');
    expect(result.current.parsedData.domains).toEqual([]);
    expect(result.current.stats.domainCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    // 远端与同源回退均失败：各尝试一次
    expect(fetchWithCacheMock).toHaveBeenCalledWith('/domains.txt');
    unmount();
  });

  it('小文本（低于阈值）立即解析，不等 300ms 防抖', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    const small = 'a.example.com\nb.example.com';
    act(() => {
      result.current.setSourceInput(small);
    });

    // 0ms 即解析：小文本不进入防抖窗口
    await advance(0);
    expect(parseSourceMock).toHaveBeenCalledWith(small);
    expect(result.current.parsedData.domains).toEqual(['a.example.com', 'b.example.com']);
    expect(result.current.stats.domainCount).toBe(2);
    unmount();
  });

  it('大文本（≥ WORKER_LINE_THRESHOLD）走 300ms 防抖', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    const large = makeLines(WORKER_LINE_THRESHOLD);
    act(() => {
      result.current.setSourceInput(large);
    });

    // 未到 300ms：不解析
    await advance(299);
    expect(parseSourceMock).not.toHaveBeenCalled();
    expect(result.current.parsedData.domains).toEqual([]);

    // 到达 300ms：解析落地
    await advance(1);
    expect(parseSourceMock).toHaveBeenCalledWith(large);
    expect(result.current.parsedData.domains.length).toBe(WORKER_LINE_THRESHOLD);
    unmount();
  });

  it('阈值边界：恰好 5000 行按大文本处理，4999 行按小文本处理', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    act(() => {
      result.current.setSourceInput(makeLines(WORKER_LINE_THRESHOLD - 1));
    });
    await advance(0);
    expect(parseSourceMock).toHaveBeenCalledTimes(1); // 4999 行：小文本立即解析

    parseSourceMock.mockClear();
    act(() => {
      result.current.setSourceInput(makeLines(WORKER_LINE_THRESHOLD));
    });
    await advance(299);
    expect(parseSourceMock).not.toHaveBeenCalled(); // 5000 行：仍在防抖窗口
    unmount();
  });
});
