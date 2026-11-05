// src/hooks/useHomeController.language.test.ts v3.15.0
// @vitest-environment jsdom
// 语言与主题切换契约（html lang/dir 同步与持久化）
// （原 useHomeController.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useHomeController } from './useHomeController';

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  fetchWithCache: vi.fn<(url: string) => Promise<string | null>>()
}));

vi.mock('sonner', () => ({
  toast: mocks.toast
}));

// 远端规则源统一走缓存层：默认返回空，分类索引请求走全局 fetch（见下方桩）
vi.mock('../utils/cachedFetch', () => ({
  fetchWithCache: mocks.fetchWithCache
}));


beforeEach(() => {
  mocks.toast.mockReset();
  mocks.fetchWithCache.mockReset();
  mocks.fetchWithCache.mockResolvedValue(null);
  // 本仓 jsdom 实际提供 localStorage，useLanguage 会把语言偏好持久化；
  // 若不清理，switchLang('en') 会串到后续用例，故每个用例从干净偏好起步。
  localStorage.clear();
  // jsdom 无 Worker / matchMedia / indexedDB：前者触发主线程回退，
  // 后两者需补最小桩，否则 useTheme 会抛错。
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }));
  // 分类索引请求：模拟文件缺失（404），分类控件应静默降级为不可用
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: false,
    status: 404,
    text: async () => ''
  })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
  document.documentElement.className = '';
});

describe('useHomeController · 语言与主题', () => {
  it('挂载时同步 <html lang> 为当前语言', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    expect(document.documentElement.lang).toBe(result.current.currentLang);
    expect(result.current.currentLang).toBe('zh-cn');
    unmount();
  });

  it('switchLang 切换语言后同步 <html lang>', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.switchLang('en');
    });

    expect(result.current.currentLang).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    unmount();
  });

  it('toggleTheme 在明暗之间切换并同步 .dark 类', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

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

  it('暴露受支持语言列表', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    expect(result.current.supportedLanguages.length).toBeGreaterThanOrEqual(16);
    unmount();
  });
});
