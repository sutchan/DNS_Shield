// src/hooks/useTheme.test.ts v3.19.0
// @vitest-environment jsdom
// 主题契约：初始化优先级为 localStorage > 系统偏好；切换时同步 <html>.dark
// 并持久化；隐私模式下存储不可用时静默降级，不影响主题切换。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useTheme } from './useTheme';

/** jsdom 不实现 matchMedia，按用例需要打桩 */
function stubPrefersDark(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  stubPrefersDark(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.documentElement.className = '';
});

describe('useTheme', () => {
  it('无本地偏好且系统非深色时为 light，且不添加 .dark', () => {
    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    unmount();
  });

  it('无本地偏好但系统偏好深色时为 dark', () => {
    stubPrefersDark(true);
    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    unmount();
  });

  it('localStorage 中的偏好优先于系统偏好', () => {
    localStorage.setItem('theme', 'light');
    stubPrefersDark(true);
    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    unmount();
  });

  it('localStorage 为 dark 时覆盖系统浅色偏好', () => {
    localStorage.setItem('theme', 'dark');
    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    unmount();
  });

  it('非法偏好值（既非 dark 也非 light）时回退系统偏好', () => {
    localStorage.setItem('theme', 'rainbow');
    stubPrefersDark(true);
    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    unmount();
  });

  it('toggleTheme 在明暗间切换并同步 .dark 类', () => {
    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    unmount();
  });

  it('切换后持久化到 localStorage', () => {
    const { result, unmount } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });
    expect(localStorage.getItem('theme')).toBe('light');
    unmount();
  });

  it('存储不可用（隐私模式抛错）时静默降级，主题切换仍可用', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    expect(() => {
      act(() => {
        result.current.toggleTheme();
      });
    }).not.toThrow();
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    getItem.mockRestore();
    setItem.mockRestore();
    unmount();
  });

  it('重复挂载读取同一持久化偏好', () => {
    const first = renderHook(() => useTheme());
    act(() => {
      first.result.current.toggleTheme();
    });
    first.unmount();

    const second = renderHook(() => useTheme());
    expect(second.result.current.theme).toBe('dark');
    second.unmount();
  });

  // v3.19.0：初始化只读取偏好、不写盘，避免把「跟随系统」固化成显式值
  it('初始化（浅色或系统深色）都不写 localStorage', () => {
    const light = renderHook(() => useTheme());
    expect(localStorage.getItem('theme')).toBeNull();
    light.unmount();

    stubPrefersDark(true);
    const dark = renderHook(() => useTheme());
    expect(dark.result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBeNull();
    dark.unmount();
  });
});
