// src/hooks/useUrlManager.preset.test.ts v3.15.0
// @vitest-environment jsdom
// 预设多镜像降级契约（依次尝试镜像直至成功）
// （原 useUrlManager.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { presetMirrors } from '../config/index';
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

describe('useUrlManager · 预设多镜像降级', () => {
  it('主源成功时不再尝试后续镜像', async () => {
    mocks.fetchWithCache.mockResolvedValue('preset.example.com');
    const { result, setSourceInput, showToast, unmount } = setup();

    await act(async () => {
      await result.current.loadPreset('builtin');
    });

    expect(mocks.fetchWithCache).toHaveBeenCalledTimes(1);
    expect(mocks.fetchWithCache).toHaveBeenCalledWith(presetMirrors.builtin[0]);
    expect(setSourceInput).toHaveBeenCalledWith('preset.example.com');
    expect(showToast).toHaveBeenCalledWith('presetLoaded', { preset: 'builtin' });
    expect(result.current.activePreset).toBe('builtin');
    unmount();
  });

  it('主源为空时自动降级到下一个镜像', async () => {
    mocks.fetchWithCache.mockImplementation(async (url: string) =>
      url === presetMirrors.builtin[0] ? null : 'mirror.example.com'
    );
    const { result, setSourceInput, unmount } = setup();

    await act(async () => {
      await result.current.loadPreset('builtin');
    });

    expect(mocks.fetchWithCache).toHaveBeenCalledTimes(2);
    expect(setSourceInput).toHaveBeenCalledWith('mirror.example.com');
    unmount();
  });

  it('全部镜像失败时提示 presetFailed，不写入输入', async () => {
    mocks.fetchWithCache.mockResolvedValue(null);
    const { result, setSourceInput, showToast, unmount } = setup();

    await act(async () => {
      await result.current.loadPreset('adguard');
    });

    expect(setSourceInput).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('presetFailed', undefined);
    // 即使失败也记录当前选中的预设，保证 UI 高亮与用户操作一致
    expect(result.current.activePreset).toBe('adguard');
    unmount();
  });

  it('未知预设名时提示 presetFailed', async () => {
    const { result, showToast, unmount } = setup();

    await act(async () => {
      await result.current.loadPreset('nope-not-a-preset');
    });

    expect(mocks.fetchWithCache).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('presetFailed', undefined);
    unmount();
  });
});
