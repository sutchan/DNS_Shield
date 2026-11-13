// src/hooks/useLanguage.test.ts v3.19.0
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
  document.documentElement.removeAttribute('lang');
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

  // v3.19.0：16 语言站必须让屏幕阅读器与 SEO 拿到真实语言声明
  it('挂载与切换时同步 <html lang>', () => {
    store.set('lang', 'vi');
    const { result, unmount } = renderHook(() => useLanguage());
    expect(document.documentElement.lang).toBe('vi');
    act(() => result.current.switchLang('ar'));
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    unmount();
  });
});

// v3.18.1：语言偏好来自 localStorage / 切换回调，必须按支持清单做枚举校验，
// 否则非法值会让 currentLang、菜单高亮与实际翻译三者不一致。
describe('语言码枚举校验', () => {
  it('localStorage 中非法语言码回退简中', () => {
    store.set('lang', 'not-a-lang');
    const { result, unmount } = renderHook(() => useLanguage());
    expect(result.current.currentLang).toBe('zh-cn');
    unmount();
  });

  it('switchLang 传入非法码时按简中落地并持久化', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    act(() => { result.current.switchLang('../../evil'); });
    expect(result.current.currentLang).toBe('zh-cn');
    expect(store.get('lang')).toBe('zh-cn');
    unmount();
  });

  it('合法语言码可正常切换并持久化', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    act(() => { result.current.switchLang('zh-tw'); });
    expect(result.current.currentLang).toBe('zh-tw');
    expect(store.get('lang')).toBe('zh-tw');
    unmount();
  });

  it('语言优先级前三为简中 / 繁中 / 英语', () => {
    const { result, unmount } = renderHook(() => useLanguage());
    expect(result.current.supportedLanguages.slice(0, 3).map((l) => l.code)).toEqual(['zh-cn', 'zh-tw', 'en']);
    unmount();
  });
});
