// src/hooks/useDomainData.sources.test.ts v3.15.0
// @vitest-environment jsdom
// 远端/本地源加载契约：远端预设源优先、失败回退同源 /domains.txt、
// 全源失败时给出用户可见告警（T-P1-09），且任何情况下都不写入非法内容。
// （原 useDomainData.test.ts 按关注点拆分，本文件承接「源加载」分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import {
  fetchWithCacheMock,
  isValidAutosaveMock,
  resetDomainDataMocks,
  advance,
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

describe('useDomainData · 远端/本地源加载', () => {
  it('优先加载远端预设源并解析', async () => {
    fetchWithCacheMock.mockImplementation(async (url: string) =>
      url.startsWith('https://') ? 'remote.example.com\nremote2.example.com' : null
    );
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('remote.example.com\nremote2.example.com');
    expect(result.current.parsedData.domains).toEqual(['remote.example.com', 'remote2.example.com']);
    // 远端成功则不再回退同源
    expect(fetchWithCacheMock).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('远端为空时回退同源 /domains.txt', async () => {
    fetchWithCacheMock.mockImplementation(async (url: string) =>
      url === '/domains.txt' ? 'local.example.com' : null
    );
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('local.example.com');
    expect(fetchWithCacheMock).toHaveBeenCalledWith('/domains.txt');
    unmount();
  });

  it('远端返回空白内容时同样回退同源', async () => {
    fetchWithCacheMock.mockImplementation(async (url: string) =>
      url === '/domains.txt' ? 'local.example.com' : '   \n  '
    );
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('local.example.com');
    unmount();
  });

  it('远端抛错时吞掉异常并复位 isLoading', async () => {
    fetchWithCacheMock.mockRejectedValue(new Error('network down'));
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sourceInput).toBe('');
    unmount();
  });

  it('远端与本地源均为空时提示 domainsLoadFailed（用户可感知，T-P1-09）', async () => {
    fetchWithCacheMock.mockResolvedValue(null);
    isValidAutosaveMock.mockReturnValue(false);
    const showToast = vi.fn();
    const { unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);

    expect(showToast).toHaveBeenCalledWith('domainsLoadFailed');
    unmount();
  });

  it('远端抛错时提示 domainsLoadFailed 且保持空状态（T-P1-09）', async () => {
    fetchWithCacheMock.mockRejectedValue(new Error('network down'));
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);

    expect(showToast).toHaveBeenCalledWith('domainsLoadFailed');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.sourceInput).toBe('');
    unmount();
  });

  it('远端内容非法（非字符串/空串）时不写入', async () => {
    fetchWithCacheMock.mockResolvedValue(null);
    isValidAutosaveMock.mockReturnValue(false);
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('');
    unmount();
  });
});
