// src/hooks/useUrlManager.validate.test.ts v3.15.0
// @vitest-environment jsdom
// URL 校验与增删契约（无效 URL 过滤、添加去重、排序与删除）。
// （原 useUrlManager.test.ts 按关注点拆分，本文件承接「URL 校验与增删」分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { setup } from '../test-utils/urlManagerTestKit';

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

describe('useUrlManager · URL 校验与增删', () => {
  it('空输入时 addUrl 提示 urlEnter 且不添加', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('   ');
    });
    act(() => {
      result.current.addUrl();
    });

    expect(showToast).toHaveBeenCalledWith('urlEnter');
    expect(result.current.urls).toEqual([]);
    unmount();
  });

  it('非法协议时提示 invalidUrl 且不添加', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('ftp://example.com/list.txt');
    });
    act(() => {
      result.current.addUrl();
    });

    expect(showToast).toHaveBeenCalledWith('invalidUrl');
    expect(result.current.urls).toEqual([]);
    unmount();
  });

  it('合法 URL 去除首尾空格后入列，并清空输入框', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('  https://example.com/a.txt  ');
    });
    act(() => {
      result.current.addUrl();
    });

    expect(result.current.urls).toEqual(['https://example.com/a.txt']);
    expect(result.current.urlInput).toBe('');
    expect(showToast).toHaveBeenCalledWith('urlAdded');
    unmount();
  });

  it('sortUrls 按字典序排序并提示 urlsSorted', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://c.example.com', 'https://a.example.com', 'https://b.example.com']);
    });
    act(() => {
      result.current.sortUrls();
    });

    expect(result.current.urls).toEqual([
      'https://a.example.com',
      'https://b.example.com',
      'https://c.example.com'
    ]);
    expect(showToast).toHaveBeenCalledWith('urlsSorted');
    unmount();
  });
});
