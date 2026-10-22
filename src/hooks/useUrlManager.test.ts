// src/hooks/useUrlManager.test.ts v3.13.1
// @vitest-environment jsdom
// URL 管理契约：受控输入框的 URL 校验/增删/排序、预设多镜像降级、
// 批量抓取的无效项过滤与失败保护（全部失败时不得清空用户已有输入）。
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useUrlManager } from './useUrlManager';
import { config, presetMirrors } from '../config/index';

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

/** 统一装配：注入可控的 setSourceInput / parseSourceData / showToast 与行号 ref */
function setup() {
  const setSourceInput = vi.fn();
  const parseSourceData = vi.fn();
  const showToast = vi.fn();
  const lineNumbersRef = { current: null as HTMLDivElement | null };

  const hook = renderHook(() =>
    useUrlManager(setSourceInput, parseSourceData, showToast, lineNumbersRef)
  );

  return { ...hook, setSourceInput, parseSourceData, showToast, lineNumbersRef };
}

describe('useUrlManager · 初始状态', () => {
  it('URL 输入框为受控状态，初值取自 config.domainsUrl', () => {
    const { result, unmount } = setup();
    expect(result.current.urlInput).toBe(config.domainsUrl);
    expect(result.current.urls).toEqual([]);
    expect(result.current.activePreset).toBe('builtin');
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('setUrlInput 更新受控输入值', () => {
    const { result, unmount } = setup();
    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });
    expect(result.current.urlInput).toBe('https://example.com/list.txt');
    unmount();
  });
});

describe('useUrlManager · URL 校验与增删', () => {
  it('空输入时 addUrl 提示 urlEnter 且不添加', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('   ');
    });
    act(() => {
      result.current.addUrl();
    });

    expect(showToast).toHaveBeenCalledWith('urlEnter');
    expect(result.current.urls).toEqual([]);
    unmount();
  });

  it('非法协议时提示 invalidUrl 且不添加', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('ftp://example.com/list.txt');
    });
    act(() => {
      result.current.addUrl();
    });

    expect(showToast).toHaveBeenCalledWith('invalidUrl');
    expect(result.current.urls).toEqual([]);
    unmount();
  });

  it('合法 URL 去除首尾空格后入列，并清空输入框', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('  https://example.com/a.txt  ');
    });
    act(() => {
      result.current.addUrl();
    });

    expect(result.current.urls).toEqual(['https://example.com/a.txt']);
    expect(result.current.urlInput).toBe('');
    expect(showToast).toHaveBeenCalledWith('urlAdded');
    unmount();
  });

  it('sortUrls 按字典序排序并提示 urlsSorted', () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://c.example.com', 'https://a.example.com', 'https://b.example.com']);
    });
    act(() => {
      result.current.sortUrls();
    });

    expect(result.current.urls).toEqual([
      'https://a.example.com',
      'https://b.example.com',
      'https://c.example.com'
    ]);
    expect(showToast).toHaveBeenCalledWith('urlsSorted');
    unmount();
  });
});

describe('useUrlManager · 单 URL 抓取', () => {
  it('URL 非法时 beforeLoad 拦截，不发起网络请求', async () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrlInput('not-a-url');
    });
    await act(async () => {
      await result.current.fetchFromUrl();
    });

    expect(mocks.fetchWithCache).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('invalidUrl');
    unmount();
  });

  it('抓取成功：写入输入、触发解析并提示 domainsFetched', async () => {
    mocks.fetchWithCache.mockResolvedValue('a.example.com\nb.example.com');
    const { result, setSourceInput, parseSourceData, showToast, unmount } = setup();

    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });
    await act(async () => {
      await result.current.fetchFromUrl();
    });

    expect(mocks.fetchWithCache).toHaveBeenCalledWith('https://example.com/list.txt');
    expect(setSourceInput).toHaveBeenCalledWith('a.example.com\nb.example.com');
    expect(parseSourceData).toHaveBeenCalledWith('a.example.com\nb.example.com');
    // withLoading 以 showToast(key, params) 调用，无参时第二参为 undefined
    expect(showToast).toHaveBeenCalledWith('domainsFetched', undefined);
    unmount();
  });

  it('空响应视为失败，提示 fetchFailed 且不写入输入', async () => {
    mocks.fetchWithCache.mockResolvedValue('   ');
    const { result, setSourceInput, showToast, unmount } = setup();

    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });
    await act(async () => {
      await result.current.fetchFromUrl();
    });

    expect(setSourceInput).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('fetchFailed', undefined);
    unmount();
  });

  it('加载期间 isLoading 为 true，结束后复位为 false', async () => {
    // 挂起 fetch，使中间态可被观测
    let release!: (v: string) => void;
    mocks.fetchWithCache.mockReturnValue(
      new Promise<string | null>((r) => {
        release = r;
      })
    );
    const { result, unmount } = setup();

    act(() => {
      result.current.setUrlInput('https://example.com/list.txt');
    });

    // 第一段 act 让 fetchFromUrl 跑到 await 处并提交 isLoading=true
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.fetchFromUrl();
      await Promise.resolve();
    });
    expect(result.current.isLoading).toBe(true);

    // 第二段 act 释放 fetch，确认结束后复位
    await act(async () => {
      release('a.example.com');
      await pending;
    });
    expect(result.current.isLoading).toBe(false);
    unmount();
  });
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

describe('useUrlManager · 批量抓取', () => {
  it('无任何有效 URL 时提示 invalidUrl 且不发起请求', async () => {
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['not-a-url', 'ftp://x.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(mocks.fetchFromUrls).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('invalidUrl');
    unmount();
  });

  it('部分 URL 非法时先提示被过滤的数量', async () => {
    mocks.fetchFromUrls.mockResolvedValue({ content: 'a.example.com\n', failedUrls: [] });
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://ok.example.com', 'bad-url']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(showToast).toHaveBeenCalledWith('invalidUrlsFiltered', { count: 1 });
    // 仅把合法 URL 交给抓取器
    expect(mocks.fetchFromUrls).toHaveBeenCalledWith(['https://ok.example.com']);
    expect(showToast).toHaveBeenCalledWith('loading', undefined);
    unmount();
  });

  it('存在失败 URL 时提示失败数，且仍写入成功部分内容', async () => {
    mocks.fetchFromUrls.mockResolvedValue({
      content: 'a.example.com\n',
      failedUrls: [{ url: 'https://bad.example.com', error: 'HTTP 500' }]
    });
    const { result, setSourceInput, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://ok.example.com', 'https://bad.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(showToast).toHaveBeenCalledWith('invalidUrlsFiltered', { count: 1 });
    expect(setSourceInput).toHaveBeenCalledWith('a.example.com\n');
    expect(showToast).toHaveBeenCalledWith('urlsFetched', undefined);
    unmount();
  });

  it('全部 URL 失败时不覆盖用户已有输入（防数据丢失）', async () => {
    mocks.fetchFromUrls.mockResolvedValue({
      content: '',
      failedUrls: [{ url: 'https://a.example.com', error: 'boom' }]
    });
    const { result, setSourceInput, parseSourceData, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://a.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(setSourceInput).not.toHaveBeenCalled();
    expect(parseSourceData).not.toHaveBeenCalled();
    unmount();
  });

  it('抓取抛错时提示 fetchFailed', async () => {
    mocks.fetchFromUrls.mockImplementation(() =>
      Promise.reject(new Error('network down'))
    );
    const { result, showToast, unmount } = setup();
    act(() => {
      result.current.setUrls(['https://a.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    expect(showToast).toHaveBeenCalledWith('fetchFailed', undefined);
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('成功抓取后同步刷新行号槽位', async () => {
    mocks.fetchFromUrls.mockResolvedValue({
      content: 'a.example.com\nb.example.com\n',
      failedUrls: []
    });
    const { result, lineNumbersRef, unmount } = setup();

    const el = document.createElement('div');
    document.body.appendChild(el);
    lineNumbersRef.current = el;

    act(() => {
      result.current.setUrls(['https://ok.example.com']);
    });
    await act(async () => {
      await result.current.fetchAllUrls();
    });

    // 响应正文末尾自带换行，故行号槽位为 3 行（空末行也计一行，与编辑器一致）
    expect(el.textContent).toBe('1\n2\n3');
    unmount();
  });
});
