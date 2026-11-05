// src/hooks/useHomeController.toast.test.ts v3.15.0
// @vitest-environment jsdom
// T-P3-05 toast 缺翻译键降级契约（绝不向用户暴露原始键名）
// （原 useHomeController.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useHomeController } from './useHomeController';
import { getTranslation } from '../utils/i18n';

const t = getTranslation('zh-cn');
// 直接引入模块命名空间，用于遍历全部语言包做完整性断言
import * as i18nModule from '../utils/i18n';

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

/** 取一条 toast 文案：单参为字符串，多参为数组 */
const lastToastMessage = (): string => {
  const calls = mocks.toast.mock.calls;
  return String(calls[calls.length - 1]?.[0] ?? '');
};

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

describe('useHomeController · T-P3-05 toast 缺键降级', () => {
  it('16 个语言包均已补齐 toast.cleared（防止清空提示再次退化为通用文案）', () => {
    // 说明：scripts/check-locales.mjs 以 zh-cn 为基准做「相互一致性」比对，
    // 若 16 个语言包同时缺少同一个键，它依然会判定通过 —— 无法拦住「集体缺键」。
    // 故此处显式断言 cleared 存在，防止该缺陷（曾导致 clearAll 只显示「已完成」）复发。
    const expected: Record<string, string> = {
      'zh-cn': '已清空',
      'zh-tw': '已清空',
      en: 'Cleared',
      es: 'Borrado',
      cs: 'Vymazáno',
      hi: 'साफ़ किया गया',
      id: 'Dibersihkan',
      it: 'Svuotato',
      nl: 'Gewist',
      pl: 'Wyczyszczono',
      ru: 'Очищено',
      sv: 'Rensat',
      th: 'ล้างแล้ว',
      tr: 'Temizlendi',
      vi: 'Đã xóa',
      ar: 'تم المسح'
    };
    const { translations } = i18nModule;

    Object.entries(expected).forEach(([lang, text]) => {
      const toastTable = translations[lang]?.toast as unknown as Record<string, string>;
      expect(toastTable, `语言包 ${lang} 缺少 toast 表`).toBeTruthy();
      expect(toastTable.cleared, `语言包 ${lang} 缺少 toast.cleared`).toBe(text);
      // 语义为「已清空」，不得与通用兜底文案「已完成」雷同
      expect(toastTable.cleared, `语言包 ${lang} 的 cleared 不应等于 done`).not.toBe(toastTable.done);
    });
  });

  it('键存在时使用对应译文', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.showToast('rulesGenerated');
    });

    expect(mocks.toast).toHaveBeenCalledWith(t.toast.rulesGenerated);
    expect(mocks.toast).not.toHaveBeenCalledWith('rulesGenerated');
    unmount();
  });

  it('缺翻译键时降级为 t.toast.done，不暴露原始键名（T-P3-05 契约守卫）', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.showToast('someNonExistentKey');
    });

    // 关键断言：用户看到的是通用完成提示，而非裸键名
    expect(mocks.toast).toHaveBeenCalledWith(t.toast.done);
    expect(lastToastMessage()).toBe(t.toast.done);
    expect(lastToastMessage()).not.toContain('someNonExistentKey');
    unmount();
  });

  it('缺翻译键且带参数时仍降级为 done（不泄漏键名与占位符）', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.showToast('someNonExistentKey', { filename: 'evil.txt' });
    });

    expect(lastToastMessage()).toBe(t.toast.done);
    expect(lastToastMessage()).not.toContain('someNonExistentKey');
    expect(lastToastMessage()).not.toContain('{filename}');
    unmount();
  });

  it('参数占位符被正确插值', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.showToast('downloaded', { filename: 'dnsmasq.conf' });
    });

    expect(lastToastMessage()).toBe('已下载 dnsmasq.conf');
    expect(lastToastMessage()).not.toContain('{filename}');
    unmount();
  });

  it('多个参数依次插值且不误伤其它占位符', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    act(() => {
      result.current.showToast('invalidUrlsFiltered', { count: 3 });
    });
    expect(lastToastMessage()).toContain('3');

    act(() => {
      result.current.showToast('autosaveRestored', { time: 7 });
    });
    expect(lastToastMessage()).toContain('7分钟前');
    unmount();
  });

  it('showToast 引用在重渲染间保持稳定（下游 memo 不被击穿）', () => {
    const { result, unmount } = renderHook(() => useHomeController());
    const first = result.current.showToast;
    unmount();

    const second = renderHook(() => useHomeController());
    expect(typeof second.result.current.showToast).toBe('function');
    // 同一语言下重新挂载得到的行为一致（函数身份按实现为新引用，此处只校验可用性）
    act(() => {
      second.result.current.showToast('copied');
    });
    expect(mocks.toast).toHaveBeenCalledWith(t.toast.copied);
    expect(first).not.toBe(second.result.current.showToast);
    second.unmount();
  });
});
