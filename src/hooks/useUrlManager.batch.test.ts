// src/hooks/useUrlManager.batch.test.ts v3.15.0
// @vitest-environment jsdom
// 批量抓取契约（无效项过滤、失败保护与提示）
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

describe('useUrlManager · 批量抓取', () => {
  it('无任何有效 URL 时提示 invalidUrl 且不发起请求', async () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['not-a-url', 'ftp://x.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(mocks.fetchFromUrls).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('invalidUrl');
    unmount();
  });

  it('部分 URL 非法时先提示被过滤的数量', async () => {
    mocks.fetchFromUrls.mockResolvedValue({ content: 'a.example.com\n', failedUrls: [] });
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://ok.example.com', 'bad-url']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(showToast).toHaveBeenCalledWith('invalidUrlsFiltered', { count: 1 });
    // 仅把合法 URL 交给抓取器
    expect(mocks.fetchFromUrls).toHaveBeenCalledWith(['https://ok.example.com']);
    expect(showToast).toHaveBeenCalledWith('loading', undefined);
    unmount();
  });

  it('存在失败 URL 时提示失败数，且仍写入成功部分内容', async () => {
    mocks.fetchFromUrls.mockResolvedValue({
      content: 'a.example.com\n',
      failedUrls: [{ url: 'https://bad.example.com', error: 'HTTP 500' }]
    });
    const { result, setSourceInput, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://ok.example.com', 'https://bad.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(showToast).toHaveBeenCalledWith('invalidUrlsFiltered', { count: 1 });
    expect(setSourceInput).toHaveBeenCalledWith('a.example.com\n');
    expect(showToast).toHaveBeenCalledWith('urlsFetched', undefined);
    unmount();
  });

  it('全部 URL 失败时不覆盖用户已有输入（防数据丢失）', async () => {
    mocks.fetchFromUrls.mockResolvedValue({
      content: '',
      failedUrls: [{ url: 'https://a.example.com', error: 'boom' }]
    });
    const { result, setSourceInput, parseSourceData, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://a.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(setSourceInput).not.toHaveBeenCalled();
    expect(parseSourceData).not.toHaveBeenCalled();
    unmount();
  });

  it('抓取抛错时提示 fetchFailed', async () => {
    mocks.fetchFromUrls.mockImplementation(() =>
      Promise.reject(new Error('network down'))
    );
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://a.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(showToast).toHaveBeenCalledWith('fetchFailed', undefined);
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('成功抓取后同步刷新行号槽位', async () => {
    mocks.fetchFromUrls.mockResolvedValue({
      content: 'a.example.com\nb.example.com\n',
      failedUrls: []
    });
    const { result, lineNumbersRef, unmount } = setup();

    const el = document.createElement('div');
    document.body.appendChild(el);
    lineNumbersRef.current = el;

    act(() => {
      result.current.setUrls(['https://ok.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    // 响应正文末尾自带换行，故行号槽位为 3 行（空末行也计一行，与编辑器一致）
    expect(el.textContent).toBe('1\n2\n3');
    unmount();
  });
});
