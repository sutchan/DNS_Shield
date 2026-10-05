// src/hooks/useLanguage.test.ts v3.12.0
// @vitest-environment jsdom
// 注意：本仓 jsdom 环境不暴露全局 localStorage（探测确认 typeof localStorage === 'undefined'），
// 而 useLanguage 直接使用裸 localStorage，故此处注入最小内存实现作为测试替身。
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useLanguage } from './useLanguage';

const store = new Map<string, string>();
const memoryStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k) : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear()
};

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage });
});
beforeEach(() => store.clear());
afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
});

describe('useLanguage', () => {
  it('默认语言为 zh-cn（无本地偏好时）', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    expect(result.current.currentLang).toBe('zh-cn');
    expect(result.current.supportedLanguages.length).toBeGreaterThanOrEqual(16);
    unmount();
  });

  it('挂载时从 localStorage 恢复已保存语言', () => {
    store.set('lang', 'en');
    const { result, unmount } = renderHook(() => useLanguage());
    expect(result.current.currentLang).toBe('en');
    unmount();
  });

  it('switchLang 切换语言并持久化', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    act(() => result.current.switchLang('vi'));
    expect(result.current.currentLang).toBe('vi');
    expect(store.get('lang')).toBe('vi');
    unmount();
  });

  it('切换到 RTL 语言时同步 <html dir>，切回 LTR 复原', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    act(() => result.current.switchLang('ar'));
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    act(() => result.current.switchLang('en'));
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    unmount();
  });
});
