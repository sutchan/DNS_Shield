// src/hooks/useHomeController.ui.test.ts v3.15.0
// @vitest-environment jsdom
// 界面状态编排契约（弹窗开关、滚动聚焦、折叠）
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

/** renderHook 暴露的 ref 为只读 RefObject；测试需注入真实 DOM 节点，
 *  故按既有范式断言为可变引用。 */
const mutableRef = <T>(ref: { current: T }): { current: T } => ref as { current: T };

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

describe('useHomeController · 界面状态编排', () => {
  it('区域折叠 / 设置弹窗 / 指南弹窗的开关状态互相独立', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    expect(result.current.isUrlSectionCollapsed).toBe(true);
    expect(result.current.isSettingsOpen).toBe(false);
    expect(result.current.isGuideOpen).toBe(false);

    act(() => {
      result.current.toggleSection('url-section');
    });
    expect(result.current.isUrlSectionCollapsed).toBe(false);

    act(() => {
      result.current.toggleSection('url-section');
    });
    expect(result.current.isUrlSectionCollapsed).toBe(true);

    // 未知 section 不改变任何状态
    act(() => {
      result.current.toggleSection('unknown-section');
    });
    expect(result.current.isUrlSectionCollapsed).toBe(true);

    act(() => {
      result.current.openSettings();
    });
    expect(result.current.isSettingsOpen).toBe(true);
    act(() => {
      result.current.closeSettings();
    });
    expect(result.current.isSettingsOpen).toBe(false);

    act(() => {
      result.current.openGuide();
    });
    expect(result.current.isGuideOpen).toBe(true);
    unmount();
  });

  it('scrollToInput 在目标存在时滚动并聚焦编辑器', () => {
    const panel = document.createElement('div');
    panel.id = 'input-panel';
    const editor = document.createElement('textarea');
    editor.id = 'source-editor';
    panel.appendChild(editor);
    document.body.appendChild(panel);

    const scrollIntoView = vi.fn();
    panel.scrollIntoView = scrollIntoView;

    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.scrollToInput();
    });

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    unmount();
  });

  it('scrollToInput 在目标缺失时静默返回', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    expect(() => {
      act(() => {
        result.current.scrollToInput();
      });
    }).not.toThrow();
    unmount();
  });

  it('syncScroll 将编辑器滚动位置同步到行号槽位', () => {
    const { result, unmount } = renderHook(() => useHomeController());

    const lineNumbers = document.createElement('div');
    document.body.appendChild(lineNumbers);
    mutableRef(result.current.lineNumbersRef).current = lineNumbers;

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    mutableRef(result.current.sourceTextareaRef).current = textarea;
    textarea.scrollTop = 96;

    act(() => {
      result.current.syncScroll();
    });
    expect(lineNumbers.scrollTop).toBe(96);
    unmount();
  });

  it('syncScroll 在任一 ref 缺失时静默跳过', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    mutableRef(result.current.sourceTextareaRef).current = null;

    expect(() => {
      act(() => {
        result.current.syncScroll();
      });
    }).not.toThrow();
    unmount();
  });
});
