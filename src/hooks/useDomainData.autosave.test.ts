// src/hooks/useDomainData.autosave.test.ts v3.15.0
// @vitest-environment jsdom
// 自动保存编排契约：草稿恢复、恢复提示、草稿优先于远端清单（T-P1-11）、手动保存。
// （原 useDomainData.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import {
  fetchWithCacheMock,
  readAutosaveMock,
  readAutosaveTimeMock,
  writeAutosaveMock,
  resetDomainDataMocks,
  advance,
  flush,
  deferred,
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


describe('自动保存编排契约：草稿恢复、恢复提示、草稿优先于远端清单（T-P1-11）、手动保存', () => {
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

    // 后续多次输入/重渲染不得再次触发恢复
    act(() => {
      result.current.setSourceInput('typed.example.com');
    });
    await advance(0);
    act(() => {
      result.current.setSourceInput('typed2.example.com');
    });
    await advance(0);

    expect(readAutosaveMock).toHaveBeenCalledTimes(1);
    expect(result.current.sourceInput).toBe('typed2.example.com');
    unmount();
  });

  it('草稿先落地时远端内容不覆盖草稿（T-P1-11）', async () => {
    // 草稿立即可读，远端刻意延后到草稿渲染完成后才兑现
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

    // 远端不得覆盖已恢复的草稿
    expect(result.current.sourceInput).toBe('draft.example.com');
    unmount();
  });

  it('远端先落地时草稿仍优先覆盖远端内容（T-P1-11）', async () => {
    // 远端立即返回；草稿刻意延后到远端渲染完成后再兑现
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

    // 草稿优先：用户本地编辑不允许被远端清单顶掉
    expect(result.current.sourceInput).toBe('draft.example.com');
    unmount();
  });

  it('saveDomains 持久化当前输入并提示 domainsSaved', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);

    act(() => {
      result.current.setSourceInput('save.example.com');
    });
    act(() => {
      result.current.saveDomains();
    });
    await flush();

    expect(writeAutosaveMock).toHaveBeenCalledWith('save.example.com');
    expect(showToast).toHaveBeenCalledWith('domainsSaved');
    unmount();
  });

  it('输入为空白时 saveDomains 不写入存储', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    act(() => {
      result.current.saveDomains();
    });
    await flush();

    expect(writeAutosaveMock).not.toHaveBeenCalled();
    unmount();
  });
});
