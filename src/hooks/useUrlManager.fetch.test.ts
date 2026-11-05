// src/hooks/useUrlManager.fetch.test.ts v3.15.0
// @vitest-environment jsdom
// 单 URL 抓取契约（超时、失败提示、成功写回）
// （原 useUrlManager.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { setup } from '../test-utils/urlManagerTestKit';

// 间谍集中挂在 hoisted 对象上（不做模块顶层解构，规避 TDZ）：
// fetchWithCache 由本文件直接控制；fetchFromUrls 替换 fileUtils 的网络副作用，
// isValidHttpUrl 保留真实实现（校验语义正是本文件的断言对象）。
const mocks = vi.hoisted(() => ({
  fetchWithCache: vi.fn<(url: string) => Promise<string | null>>(),
  fetchFromUrls: vi.fn<
    (urls: string[]) => Promise<{ content: string; failedUrls: { url: string; error: string }[] }>
  >()
}));

vi.mock('../utils/cachedFetch', () => ({
  fetchWithCache: mocks.fetchWithCache
}));

vi.mock('../utils/fileUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/fileUtils')>();
  return { ...actual, fetchFromUrls: mocks.fetchFromUrls };
});

beforeEach(() => {
  mocks.fetchWithCache.mockReset();
  mocks.fetchFromUrls.mockReset();
  mocks.fetchWithCache.mockResolvedValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('useUrlManager · 单 URL 抓取', () => {
  it('URL 非法时 beforeLoad 拦截，不发起网络请求', async () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('not-a-url');
    });
    await act(async () => {
      await result.current.fetchFromUrl();
    });

    expect(mocks.fetchWithCache).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('invalidUrl');
    unmount();
  });

  it('抓取成功：写入输入、触发解析并提示 domainsFetched', async () => {
    mocks.fetchWithCache.mockResolvedValue('a.example.com\nb.example.com');
    const { result, setSourceInput, parseSourceData, showToast, unmount } = setup();

    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });
    await act(async () => {
      await result.current.fetchFromUrl();
    });

    expect(mocks.fetchWithCache).toHaveBeenCalledWith('https://example.com/list.txt');
    expect(setSourceInput).toHaveBeenCalledWith('a.example.com\nb.example.com');
    expect(parseSourceData).toHaveBeenCalledWith('a.example.com\nb.example.com');
    // withLoading 以 showToast(key, params) 调用，无参时第二参为 undefined
    expect(showToast).toHaveBeenCalledWith('domainsFetched', undefined);
    unmount();
  });

  it('空响应视为失败，提示 fetchFailed 且不写入输入', async () => {
    mocks.fetchWithCache.mockResolvedValue('   ');
    const { result, setSourceInput, showToast, unmount } = setup();

    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });
    await act(async () => {
      await result.current.fetchFromUrl();
    });

    expect(setSourceInput).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('fetchFailed', undefined);
    unmount();
  });

  it('加载期间 isLoading 为 true，结束后复位为 false', async () => {
    // 挂起 fetch，使中间态可被观测
    let release!: (v: string) => void;
    mocks.fetchWithCache.mockReturnValue(
      new Promise<string | null>((r) => {
        release = r;
      })
    );
    const { result, unmount } = setup();

    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });

    // 第一段 act 让 fetchFromUrl 跑到 await 处并提交 isLoading=true
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.fetchFromUrl();
      await Promise.resolve();
    });
    expect(result.current.isLoading).toBe(true);

    // 第二段 act 释放 fetch，确认结束后复位
    await act(async () => {
      release('a.example.com');
      await pending;
    });
    expect(result.current.isLoading).toBe(false);
    unmount();
  });
});
