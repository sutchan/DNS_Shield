// src/hooks/useDomainData.autosave.priority.test.ts v3.22.4
// @vitest-environment jsdom
// 自动保存编排契约（B）：草稿/远端优先级与手动保存结果反馈。
// （T-REFACTOR-01：从 useDomainData.autosave.test.ts 按关注点拆出）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import {
  fetchWithCacheMock,
  readAutosaveMock,
  writeAutosaveMock,
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

describe('自动保存：草稿优先与手动保存', () => {
  it('草稿先落地时远端内容不覆盖草稿（T-P1-11）', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    const remote = deferred<string | null>();
    fetchWithCacheMock.mockReturnValue(remote.promise);
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();
    expect(result.current.sourceInput).toBe('draft.example.com');
    remote.resolve('remote.example.com');
    await flush();
    await advance(0);
    expect(result.current.sourceInput).toBe('draft.example.com');
    unmount();
  });

  it('远端先落地时草稿仍优先覆盖远端内容（T-P1-11）', async () => {
    fetchWithCacheMock.mockResolvedValue('remote.example.com');
    const draft = deferred<string | null>();
    readAutosaveMock.mockReturnValue(draft.promise);
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();
    expect(result.current.sourceInput).toBe('remote.example.com');
    draft.resolve('draft.example.com');
    await flush();
    await advance(0);
    expect(result.current.sourceInput).toBe('draft.example.com');
    unmount();
  });

  it('saveDomains 持久化当前输入并提示 domainsSaved', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    act(() => { result.current.setSourceInput('save.example.com'); });
    act(() => { result.current.saveDomains(); });
    await flush();
    expect(writeAutosaveMock).toHaveBeenCalledWith('save.example.com');
    expect(showToast).toHaveBeenCalledWith('domainsSaved');
    unmount();
  });

  it('saveDomains 写入失败时提示 autosaveFailed 而非 domainsSaved（T-AUD-H04）', async () => {
    writeAutosaveMock.mockResolvedValue({ ok: false, reason: 'oversize' });
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    act(() => { result.current.setSourceInput('large.example.com'); });
    act(() => { result.current.saveDomains(); });
    await flush();
    expect(showToast).toHaveBeenCalledWith('autosaveFailed');
    expect(showToast).not.toHaveBeenCalledWith('domainsSaved');
    unmount();
  });

  it('输入为空白时 saveDomains 不写入存储', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    act(() => { result.current.saveDomains(); });
    await flush();
    expect(writeAutosaveMock).not.toHaveBeenCalled();
    unmount();
  });
});
