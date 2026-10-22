// src/hooks/useDomainData.test.ts v3.13.1
// @vitest-environment jsdom
// 解析编排契约（T-P1-05）：
//   小文本（< WORKER_LINE_THRESHOLD）立即解析以保预览实时；大文本走 300ms 防抖，
//   避免每次按键都触发重计算；parseSourceData 可被外部显式触发解析。
// 本仓 jsdom 不提供 Worker / IndexedDB，故实际覆盖 useRuleWorker 的主线程回退路径。
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import { WORKER_LINE_THRESHOLD } from './useRuleWorker';
import { fetchWithCache } from '../utils/cachedFetch';
import { parseSource } from '../utils/parser';
import {
  isValidAutosave,
  writeAutosave,
  clearAutosave,
  readAutosave,
  readAutosaveTime
} from './autosaveStorage';

vi.mock('../utils/cachedFetch', () => ({
  fetchWithCache: vi.fn()
}));

vi.mock('./autosaveStorage', () => ({
  isValidAutosave: vi.fn(),
  writeAutosave: vi.fn(),
  clearAutosave: vi.fn(),
  readAutosave: vi.fn(),
  readAutosaveTime: vi.fn()
}));

vi.mock('../utils/parser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/parser')>();
  return { ...actual, parseSource: vi.fn(actual.parseSource) };
});

const fetchWithCacheMock = vi.mocked(fetchWithCache);
const parseSourceMock = vi.mocked(parseSource);
const isValidAutosaveMock = vi.mocked(isValidAutosave);
const writeAutosaveMock = vi.mocked(writeAutosave);
const clearAutosaveMock = vi.mocked(clearAutosave);
const readAutosaveMock = vi.mocked(readAutosave);
const readAutosaveTimeMock = vi.mocked(readAutosaveTime);

/** 造一份合法草稿（非空字符串），其余一律判为非法 */
const withValidAutosave = () => {
  isValidAutosaveMock.mockImplementation((v): v is string => typeof v === 'string' && v.length > 0);
};

beforeEach(() => {
  vi.useFakeTimers();
  fetchWithCacheMock.mockReset();
  parseSourceMock.mockClear();
  fetchWithCacheMock.mockResolvedValue(null);
  readAutosaveMock.mockResolvedValue(null);
  readAutosaveTimeMock.mockResolvedValue(null);
  writeAutosaveMock.mockResolvedValue(undefined);
  clearAutosaveMock.mockResolvedValue(undefined);
  withValidAutosave();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

/** 推进定时器并冲刷微任务（parseSourceData 是 async，需让 promise 链落地） */
async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

/** 仅冲刷微任务，不推进定时器 */
async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

/** 造 n 行域名文本 */
const makeLines = (n: number) => Array.from({ length: n }, (_, i) => `d${i}.example.com`).join('\n');

/** 可手动兑现的 promise：用于精确控制异步恢复与远端加载的先后顺序 */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}


/** renderHook 暴露的 ref 为只读 RefObject；测试需注入真实 DOM 节点，
 *  故按 useModalA11y.test.ts 的既有范式断言为可变引用。 */
const mutableRef = <T>(ref: { current: T }): { current: T } => ref as { current: T };

describe('useDomainData · 防抖解析（T-P1-05）', () => {
  it('挂载时状态为空，且远端加载失败时保留空状态', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('');
    expect(result.current.parsedData.domains).toEqual([]);
    expect(result.current.stats.domainCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    // 远端与同源回退均失败：各尝试一次
    expect(fetchWithCacheMock).toHaveBeenCalledWith('/domains.txt');
    unmount();
  });

  it('小文本（低于阈值）立即解析，不等 300ms 防抖', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    const small = 'a.example.com\nb.example.com';
    act(() => {
      result.current.setSourceInput(small);
    });

    // 0ms 即解析：小文本不进入防抖窗口
    await advance(0);
    expect(parseSourceMock).toHaveBeenCalledWith(small);
    expect(result.current.parsedData.domains).toEqual(['a.example.com', 'b.example.com']);
    expect(result.current.stats.domainCount).toBe(2);
    unmount();
  });

  it('大文本（≥ WORKER_LINE_THRESHOLD）走 300ms 防抖', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    const large = makeLines(WORKER_LINE_THRESHOLD);
    act(() => {
      result.current.setSourceInput(large);
    });

    // 未到 300ms：不解析
    await advance(299);
    expect(parseSourceMock).not.toHaveBeenCalled();
    expect(result.current.parsedData.domains).toEqual([]);

    // 到达 300ms：解析落地
    await advance(1);
    expect(parseSourceMock).toHaveBeenCalledWith(large);
    expect(result.current.parsedData.domains.length).toBe(WORKER_LINE_THRESHOLD);
    unmount();
  });

  it('阈值边界：恰好 5000 行按大文本处理，4999 行按小文本处理', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    act(() => {
      result.current.setSourceInput(makeLines(WORKER_LINE_THRESHOLD - 1));
    });
    await advance(0);
    expect(parseSourceMock).toHaveBeenCalledTimes(1); // 4999 行：小文本立即解析

    parseSourceMock.mockClear();
    act(() => {
      result.current.setSourceInput(makeLines(WORKER_LINE_THRESHOLD));
    });
    await advance(299);
    expect(parseSourceMock).not.toHaveBeenCalled(); // 5000 行：仍在防抖窗口
    unmount();
  });

  it('连续输入只保留最后一次解析（防抖被反复重置）', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    // 三份均为大文本（落入 300ms 防抖窗口），每 100ms 追加一行
    let text = makeLines(WORKER_LINE_THRESHOLD);
    act(() => {
      result.current.setSourceInput(text);
    });
    for (const extra of ['extra1.example.com', 'extra2.example.com']) {
      await advance(100);
      text += `\n${extra}`;
      act(() => {
        result.current.setSourceInput(text);
      });
    }

    // 300ms 窗口内被重置，最终只解析最后一份
    await advance(300);
    expect(parseSourceMock).toHaveBeenCalledTimes(1);
    expect(parseSourceMock).toHaveBeenCalledWith(text);
    expect(result.current.parsedData.domains).toContain('extra2.example.com');
    unmount();
  });

  it('parseSourceData 可被外部显式触发解析', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    parseSourceMock.mockClear();

    const text = 'x.example.com\ny.example.com';
    act(() => {
      result.current.parseSourceData(text);
    });
    await flush();

    expect(parseSourceMock).toHaveBeenCalledWith(text);
    expect(result.current.parsedData.domains).toEqual(['x.example.com', 'y.example.com']);
    unmount();
  });

  it('parseSourceData 无参时回退读取 ref 中的最新输入', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    const text = 'ref.example.com';
    act(() => {
      result.current.setSourceInput(text);
    });
    parseSourceMock.mockClear();
    act(() => {
      result.current.parseSourceData();
    });
    await flush();

    expect(parseSourceMock).toHaveBeenCalledWith(text);
    unmount();
  });

  it('解析抛错时降级为 parseFailed 提示，不崩溃', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    showToast.mockClear();

    parseSourceMock.mockImplementationOnce(() => {
      throw new Error('parse boom');
    });
    act(() => {
      result.current.parseSourceData('bad.example.com');
    });
    await flush();

    expect(showToast).toHaveBeenCalledWith('parseFailed');
    unmount();
  });
});

describe('useDomainData · 远端/本地源加载', () => {
  it('优先加载远端预设源并解析', async () => {
    fetchWithCacheMock.mockImplementation(async (url: string) =>
      url.startsWith('https://') ? 'remote.example.com\nremote2.example.com' : null
    );
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('remote.example.com\nremote2.example.com');
    expect(result.current.parsedData.domains).toEqual(['remote.example.com', 'remote2.example.com']);
    // 远端成功则不再回退同源
    expect(fetchWithCacheMock).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('远端为空时回退同源 /domains.txt', async () => {
    fetchWithCacheMock.mockImplementation(async (url: string) =>
      url === '/domains.txt' ? 'local.example.com' : null
    );
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('local.example.com');
    expect(fetchWithCacheMock).toHaveBeenCalledWith('/domains.txt');
    unmount();
  });

  it('远端返回空白内容时同样回退同源', async () => {
    fetchWithCacheMock.mockImplementation(async (url: string) =>
      url === '/domains.txt' ? 'local.example.com' : '   \n  '
    );
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('local.example.com');
    unmount();
  });

  it('远端抛错时吞掉异常并复位 isLoading', async () => {
    fetchWithCacheMock.mockRejectedValue(new Error('network down'));
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sourceInput).toBe('');
    unmount();
  });

  it('远端内容非法（非字符串/空串）时不写入', async () => {
    fetchWithCacheMock.mockResolvedValue(null);
    isValidAutosaveMock.mockReturnValue(false);
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    expect(result.current.sourceInput).toBe('');
    unmount();
  });
});

describe('useDomainData · 自动保存编排', () => {
  it('挂载时恢复本地草稿并解析', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com\ndraft2.example.com');
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();

    expect(result.current.sourceInput).toBe('draft.example.com\ndraft2.example.com');
    expect(result.current.parsedData.domains).toEqual(['draft.example.com', 'draft2.example.com']);
    unmount();
  });

  it('草稿时间超过 1 分钟时提示 autosaveRestored 并带分钟数', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    readAutosaveTimeMock.mockResolvedValue(Date.now() - 5 * 60 * 1000);
    const showToast = vi.fn();
    const { unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    await flush();

    expect(showToast).toHaveBeenCalledWith('autosaveRestored', { time: 5 });
    unmount();
  });

  it('草稿时间不足 1 分钟时不提示 autosaveRestored', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    readAutosaveTimeMock.mockResolvedValue(Date.now() - 30 * 1000);
    const showToast = vi.fn();
    const { unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    await flush();

    expect(showToast).not.toHaveBeenCalledWith('autosaveRestored', expect.anything());
    unmount();
  });

  it('草稿恢复严格只执行一次（restoredRef 单次守卫）', async () => {
    readAutosaveMock.mockResolvedValue('draft.example.com');
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();

    expect(readAutosaveMock).toHaveBeenCalledTimes(1);

    // 后续多次输入/重渲染不得再次触发恢复
    act(() => {
      result.current.setSourceInput('typed.example.com');
    });
    await advance(0);
    act(() => {
      result.current.setSourceInput('typed2.example.com');
    });
    await advance(0);

    expect(readAutosaveMock).toHaveBeenCalledTimes(1);
    expect(result.current.sourceInput).toBe('typed2.example.com');
    unmount();
  });

  it('远端先落地时本地草稿不覆盖远端内容', async () => {
    // 远端立即返回；草稿刻意延后到远端渲染完成后再兑现
    fetchWithCacheMock.mockResolvedValue('remote.example.com');
    const draft = deferred<string | null>();
    readAutosaveMock.mockReturnValue(draft.promise);

    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);
    await flush();
    expect(result.current.sourceInput).toBe('remote.example.com');

    draft.resolve('draft.example.com');
    await flush();

    expect(result.current.sourceInput).toBe('remote.example.com');
    unmount();
  });

  it('saveDomains 持久化当前输入并提示 domainsSaved', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);

    act(() => {
      result.current.setSourceInput('save.example.com');
    });
    act(() => {
      result.current.saveDomains();
    });
    await flush();

    expect(writeAutosaveMock).toHaveBeenCalledWith('save.example.com');
    expect(showToast).toHaveBeenCalledWith('domainsSaved');
    unmount();
  });

  it('输入为空白时 saveDomains 不写入存储', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    act(() => {
      result.current.saveDomains();
    });
    await flush();

    expect(writeAutosaveMock).not.toHaveBeenCalled();
    unmount();
  });
});

describe('useDomainData · 排序 / 去重 / 清空 / 输入', () => {
  it('sortDomains 排序并重新解析，提示 domainsSorted', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    showToast.mockClear();

    act(() => {
      result.current.setSourceInput('b.example.com\na.example.com');
    });
    act(() => {
      result.current.sortDomains();
    });
    await flush();

    expect(result.current.sourceInput).toBe('a.example.com\nb.example.com');
    expect(result.current.parsedData.domains).toEqual(['a.example.com', 'b.example.com']);
    expect(showToast).toHaveBeenCalledWith('domainsSorted');
    unmount();
  });

  it('dedupeDomains 去重并提示移除行数', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    showToast.mockClear();

    act(() => {
      result.current.setSourceInput('a.example.com\na.example.com\nb.example.com');
    });
    act(() => {
      result.current.dedupeDomains();
    });
    await flush();

    expect(result.current.sourceInput).toBe('a.example.com\nb.example.com');
    expect(showToast).toHaveBeenCalledWith('duplicatesRemoved', { count: 1 });
    unmount();
  });

  it('clearAll 清空输入/解析/统计并清除本地草稿', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useDomainData(showToast));
    await advance(0);
    act(() => {
      result.current.setSourceInput('a.example.com');
    });
    await advance(0);
    showToast.mockClear();

    act(() => {
      result.current.clearAll();
    });
    await flush();

    expect(result.current.sourceInput).toBe('');
    expect(result.current.parsedData.domains).toEqual([]);
    expect(result.current.stats).toEqual({
      domainCount: 0,
      validCount: 0,
      commentCount: 0,
      blacklistCount: 0,
      whitelistCount: 0,
      customDnsCount: 0,
      totalLines: 0,
      invalidCount: 0
    });
    expect(clearAutosaveMock).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('cleared');
    unmount();
  });

  it('handleSourceInput 更新输入并刷新行号槽位', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    const lineNumbers = document.createElement('div');
    document.body.appendChild(lineNumbers);
    mutableRef(result.current.lineNumbersRef).current = lineNumbers;

    act(() => {
      result.current.handleSourceInput({
        target: { value: 'a.example.com\nb.example.com' }
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.sourceInput).toBe('a.example.com\nb.example.com');
    expect(lineNumbers.textContent).toBe('1\n2');
    unmount();
  });

  it('setStats 可直接覆盖统计（供 useRules 回写生效后统计）', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    act(() => {
      result.current.setStats((prev: typeof result.current.stats) => ({ ...prev, blacklistCount: 42 }));
    });
    expect(result.current.stats.blacklistCount).toBe(42);
    unmount();
  });

  it('暴露 Worker 处理状态（未走 Worker 时均为静默值）', async () => {
    const { result, unmount } = renderHook(() => useDomainData(vi.fn()));
    await advance(0);

    // jsdom 无 Worker，主线程回退路径下不产生进度
    expect(result.current.progress).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    unmount();
  });
});
