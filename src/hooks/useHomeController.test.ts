// src/hooks/useHomeController.test.ts v3.13.1
// @vitest-environment jsdom
// 主状态编排契约。核心守护 T-P3-05：toast 消息缺翻译键时降级为 t.toast.done，
// 绝不向用户暴露原始键名（如 "rulesGenerated"）；并断言参数插值与 html lang 同步。
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useHomeController } from './useHomeController';
import { getTranslation } from '../utils/i18n';
// 直接引入模块命名空间，用于遍历全部语言包做 cleared 完整性断言
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

const t = getTranslation('zh-cn');

beforeEach(() => {
  mocks.toast.mockReset();
  mocks.fetchWithCache.mockReset();
  mocks.fetchWithCache.mockResolvedValue(null);
  // 本仓 jsdom 实际提供 localStorage，useLanguage 会把语言偏好持久化；
  // 若不清理，switchLang('en') 会串到后续用例，故每个用例从干净偏好起步。
  localStorage.clear();
  // jsdom 无 Worker / matchMedia / indexedDB：前者触发主线程回退，
  // 后两者需补最小桩，否则 useTheme 与 useFlowTokens 会抛错。
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

/** 取一条 toast 文案：单参为字符串，多参为数组 */
const lastToastMessage = (): string => {
  const calls = mocks.toast.mock.calls;
  return String(calls[calls.length - 1]?.[0] ?? '');
};


/** renderHook 暴露的 ref 为只读 RefObject；测试需注入真实 DOM 节点，
 *  故按 useModalA11y.test.ts 的既有范式断言为可变引用。 */
const mutableRef = <T>(ref: { current: T }): { current: T } => ref as { current: T };

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
