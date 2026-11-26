// src/hooks/useDomainData.autosave.test.ts v3.22.4
// @vitest-environment jsdom
// 自动保存编排契约（A）：草稿恢复、恢复提示、单次守卫与用户编辑保护。
// （T-REFACTOR-01：原 229 行文件按关注点拆为 restore 与 priority 两组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import {
  readAutosaveMock,
  readAutosaveTimeMock,
  resetDomainDataMocks,
  advance,
  flush,
  deferred,
} from '../test-utils/domainDataTestKit';

vi.mock('../utils/cachedFetch', () => ({ fetchWithCache: vi.fn() }));
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

describe('自动保存：草稿恢复与提示', () => {
  it('挂载时恢复本地草稿并解析', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com\ndraft2.example.com');
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();
    expect(result.current.sourceInput).toBe('draft.example.com\ndraft2.example.com');
    expect(result.current.parsedData.domains).toEqual(['draft.example.com', 'draft2.example.com']);
    unmount();
  });

  it('草稿时间超过 1 分钟时提示 autosaveRestored 并带分钟数', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    readAutosaveTimeMock.mockResolvedValue(Date.now() - 5 * 60 * 1000);
    const showToast = vi.fn();
    const { unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    await flush();
    expect(showToast).toHaveBeenCalledWith('autosaveRestored', { time: 5 });
    unmount();
  });

  it('草稿时间不足 1 分钟时不提示 autosaveRestored', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    readAutosaveTimeMock.mockResolvedValue(Date.now() - 30 * 1000);
    const showToast = vi.fn();
    const { unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    await flush();
    expect(showToast).not.toHaveBeenCalledWith('autosaveRestored', expect.anything());
    unmount();
  });

  it('草稿恢复严格只执行一次（restoredRef 单次守卫）', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();
    expect(readAutosaveMock).toHaveBeenCalledTimes(1);
    act(() => { result.current.setSourceInput('typed.example.com'); });
    await advance(0);
    act(() => { result.current.setSourceInput('typed2.example.com'); });
    await advance(0);
    expect(readAutosaveMock).toHaveBeenCalledTimes(1);
    expect(result.current.sourceInput).toBe('typed2.example.com');
    unmount();
  });

  it('异步恢复期间用户已输入时草稿不覆盖（T-AUD-L05）', async () => {
    const pending = deferred<string | null>();
    readAutosaveMock.mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await flush();
    act(() => {
      result.current.handleSourceInput({ target: { value: 'typed-first.example.com' } } as never);
    });
    await flush();
    pending.resolve('draft.example.com');
    await flush();
    expect(result.current.sourceInput).toBe('typed-first.example.com');
    unmount();
  });

  it('纯空白草稿被跳过，不覆盖空输入（T-AUD-L05）', async () => {
    readAutosaveMock.mockResolvedValue('  \n  ');
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();
    expect(result.current.sourceInput).toBe('');
    unmount();
  });
});
