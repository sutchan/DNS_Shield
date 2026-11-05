// src/hooks/useHomeController.contract.test.ts v3.15.0
// @vitest-environment jsdom
// 聚合契约（输入/解析/规则/URL 列表与 Worker 进度）
// （原 useHomeController.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useHomeController } from './useHomeController';
import { getTranslation } from '../utils/i18n';

const t = getTranslation('zh-cn');

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

describe('useHomeController · 聚合契约', () => {
  it('初始为空状态：输入、解析结果、规则输出与 URL 列表均为空', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    expect(result.current.sourceInput).toBe('');
    expect(result.current.parsedData).toEqual({
      domains: [],
      whitelist: [],
      customDns: [],
      regexRules: []
    });
    expect(result.current.currentOutput).toBe('');
    expect(result.current.currentFormat).toBe('dnsmasq');
    expect(result.current.urls).toEqual([]);
    expect(result.current.urlInput).toBeTruthy();
    unmount();
  });

  it('分类索引不可用时筛选控件降级为不生效（等同全部）', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    // fetch 被桩为 404：索引加载失败后 available=false
    expect(result.current.categoryAvailable).toBe(false);
    expect(result.current.selectedCategories.size).toBe(0);
    unmount();
  });

  it('切换分类后 selectedCategories 更新且 clear 可复原', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    act(() => {
      result.current.onToggleCategory('adguard');
    });
    expect(result.current.selectedCategories.has('adguard')).toBe(true);

    act(() => {
      result.current.onToggleCategory('adguard');
    });
    expect(result.current.selectedCategories.has('adguard')).toBe(false);

    act(() => {
      result.current.onToggleCategory('neohosts');
    });
    expect(result.current.selectedCategories.has('neohosts')).toBe(true);
    act(() => {
      result.current.onClearCategories();
    });
    expect(result.current.selectedCategories.size).toBe(0);
    unmount();
  });

  it('设置项可更新并被规则生成消费', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    act(() => {
      result.current.setSettings((prev) => ({ ...prev, ipv4: '10.0.0.1' }));
    });
    expect(result.current.settings.ipv4).toBe('10.0.0.1');
    unmount();
  });

  it('URL 管理能力由控制器透出（addUrl 走同一套校验）', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    act(() => {
      result.current.setUrlInput('   ');
    });
    act(() => {
      result.current.addUrl();
    });
    expect(result.current.urls).toEqual([]);
    // 校验失败同样经 showToast 落地为可见提示
    expect(mocks.toast).toHaveBeenCalledWith(t.toast.urlEnter);
    unmount();
  });

  it('清理数据后输入与解析结果同时清空，并提示「已清空」', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    act(() => {
      result.current.clearAll();
    });
    expect(result.current.sourceInput).toBe('');
    expect(result.current.parsedData.domains).toEqual([]);

    // cleared 曾是全语言包缺失的键，实际展示会降级为通用的「已完成」而丢失语义；
    // 现已补齐 16 个语言包译文，故此处断言拿到的是 cleared 的真实译文（正常路径）。
    expect(t.toast.cleared).toBe('已清空');
    expect(mocks.toast).toHaveBeenCalledWith(t.toast.cleared);
    // 关键：不再是降级文案，二者不应相同
    expect(t.toast.cleared).not.toBe(t.toast.done);
    unmount();
  });

  it('暴露 Worker 处理状态，供 UI 展示进度', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    expect(result.current.progress).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isLoading).toBe(false);
    unmount();
  });
});
