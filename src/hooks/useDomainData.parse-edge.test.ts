// src/hooks/useDomainData.parse-edge.test.ts v3.15.0
// @vitest-environment jsdom
// 解析编排边界契约：连续输入只保留最后一次、显式触发解析、解析失败降级提示。
// （原 useDomainData.test.ts 按关注点拆分，本文件承接其中一个分组）
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useDomainData } from './useDomainData';
import { WORKER_LINE_THRESHOLD } from './useRuleWorker';
import {
  parseSourceMock,
  resetDomainDataMocks,
  advance,
  flush,
  makeLines,
} from '../test-utils/domainDataTestKit';

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

beforeEach(() => {
  vi.useFakeTimers();
  resetDomainDataMocks();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});


describe('解析编排边界契约：连续输入只保留最后一次、显式触发解析、解析失败降级提示', () => {
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
