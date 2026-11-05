// src/hooks/useUrlManager.basic.test.ts v3.15.0
// @vitest-environment jsdom
// 受控输入与 URL 校验/增删契约
// （原 useUrlManager.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { config } from '../config/index';
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

describe('useUrlManager · 初始状态', () => {
  it('URL 输入框为受控状态，初值取自 config.domainsUrl', () => {
    const { result, unmount } = setup();
    expect(result.current.urlInput).toBe(config.domainsUrl);
    expect(result.current.urls).toEqual([]);
    expect(result.current.activePreset).toBe('builtin');
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('setUrlInput 更新受控输入值', () => {
    const { result, unmount } = setup();
    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });
    expect(result.current.urlInput).toBe('https://example.com/list.txt');
    unmount();
  });
});
