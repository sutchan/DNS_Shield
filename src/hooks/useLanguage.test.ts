// src/hooks/useLanguage.test.ts v3.12.0
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useLanguage } from './useLanguage';

beforeEach(() => localStorage.clear());
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
    localStorage.setItem('lang', 'en');
    const { result, unmount } = renderHook(() => useLanguage());
    expect(result.current.currentLang).toBe('en');
    unmount();
  });

  it('switchLang 切换语言并持久化', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    act(() => result.current.switchLang('vi'));
    expect(result.current.currentLang).toBe('vi');
    expect(localStorage.getItem('lang')).toBe('vi');
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
