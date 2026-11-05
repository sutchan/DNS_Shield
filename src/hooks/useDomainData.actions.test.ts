// src/hooks/useDomainData.actions.test.ts v3.15.0
// @vitest-environment jsdom
// 排序 / 去重 / 清空 / 输入交互契约。
// （原 useDomainData.test.ts 按关注点拆分，本文件承接「操作」分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import {
  clearAutosaveMock,
  resetDomainDataMocks,
  advance,
  flush,
  mutableRef,
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

describe('useDomainData · 排序 / 去重 / 清空 / 输入', () => {
  it('sortDomains 排序并重新解析，提示 domainsSorted', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    showToast.mockClear();

    act(() => {
      result.current.setSourceInput('b.example.com\na.example.com');
    });
    act(() => {
      result.current.sortDomains();
    });
    await flush();

    expect(result.current.sourceInput).toBe('a.example.com\nb.example.com');
    expect(result.current.parsedData.domains).toEqual(['a.example.com', 'b.example.com']);
    expect(showToast).toHaveBeenCalledWith('domainsSorted');
    unmount();
  });

  it('dedupeDomains 去重并提示移除行数', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    showToast.mockClear();

    act(() => {
      result.current.setSourceInput('a.example.com\na.example.com\nb.example.com');
    });
    act(() => {
      result.current.dedupeDomains();
    });
    await flush();

    expect(result.current.sourceInput).toBe('a.example.com\nb.example.com');
    expect(showToast).toHaveBeenCalledWith('duplicatesRemoved', { count: 1 });
    unmount();
  });

  it('clearAll 清空输入/解析/统计并清除本地草稿', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    act(() => {
      result.current.setSourceInput('a.example.com');
    });
    await advance(0);
    showToast.mockClear();

    act(() => {
      result.current.clearAll();
    });
    await flush();

    expect(result.current.sourceInput).toBe('');
    expect(result.current.parsedData.domains).toEqual([]);
    expect(result.current.stats).toEqual({
      domainCount: 0,
      validCount: 0,
      commentCount: 0,
      blacklistCount: 0,
      whitelistCount: 0,
      customDnsCount: 0,
      totalLines: 0,
      invalidCount: 0
    });
    expect(clearAutosaveMock).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('cleared');
    unmount();
  });

  it('handleSourceInput 更新输入并刷新行号槽位', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    const lineNumbers = document.createElement('div');
    document.body.appendChild(lineNumbers);
    mutableRef(result.current.lineNumbersRef).current = lineNumbers;

    act(() => {
      result.current.handleSourceInput({
        target: { value: 'a.example.com\nb.example.com' }
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.sourceInput).toBe('a.example.com\nb.example.com');
    expect(lineNumbers.textContent).toBe('1\n2');
    unmount();
  });

  it('setStats 可直接覆盖统计（供 useRules 回写生效后统计）', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    act(() => {
      result.current.setStats((prev: typeof result.current.stats) => ({ ...prev, blacklistCount: 42 }));
    });
    expect(result.current.stats.blacklistCount).toBe(42);
    unmount();
  });

  it('暴露 Worker 处理状态（未走 Worker 时均为静默值）', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    // jsdom 无 Worker，主线程回退路径下不产生进度
    expect(result.current.progress).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    unmount();
  });
});
