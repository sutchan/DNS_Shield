// src/hooks/useAsyncRuleProcessing.fallback.test.ts v3.18.1
// @vitest-environment jsdom
// 回归：Worker 失败 / 崩溃 / postMessage 异常会以空文本或 null 兜底，
// 排序与去重必须回退主线程同步实现，不能把空串当成功结果写回输入框（数据丢失）。
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../test-utils/renderHook';

const { runMock } = vi.hoisted(() => ({ runMock: vi.fn() }));

vi.mock('./useRuleWorker', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./useRuleWorker')>();
  return {
    ...actual,
    useRuleWorker: () => ({
      run: runMock,
      progress: null,
      isProcessing: false,
      isSupported: true
    })
  };
});

import { useAsyncRuleProcessing } from './useAsyncRuleProcessing';
import { WORKER_LINE_THRESHOLD } from './useRuleWorker';

// 超过 Worker 阈值才会走 run()；文本需非空，否则空串本身是合法结果
const bigText = Array.from(
  { length: WORKER_LINE_THRESHOLD + 1 },
  (_, i) => `example${i}.com`
).join('\n');

beforeEach(() => { runMock.mockReset(); });

describe('Worker 失败兜底', () => {
  it('sort 收到空文本时回退同步排序，不返回空串', async () => {
    runMock.mockResolvedValue({ kind: 'text', text: '', elapsed: 0 });
    const { result, unmount } = renderHook(() => useAsyncRuleProcessing());
    const sorted = await result.current.processSort(bigText);
    expect(sorted).not.toBe('');
    expect(sorted).toContain('example0.com');
    unmount();
  });

  it('sort 收到 null 时回退同步排序，不再静默失败', async () => {
    runMock.mockResolvedValue(null);
    const { result, unmount } = renderHook(() => useAsyncRuleProcessing());
    expect(await result.current.processSort(bigText)).toContain('example0.com');
    unmount();
  });

  it('dedupe 收到空文本时回退同步去重', async () => {
    runMock.mockResolvedValue({ kind: 'text', text: '', elapsed: 0 });
    const { result, unmount } = renderHook(() => useAsyncRuleProcessing());
    const out = await result.current.processDedupe(bigText);
    expect(out?.content).toContain('example0.com');
    unmount();
  });

  it('Worker 正常返回时直接采用其结果，不重复同步计算', async () => {
    runMock.mockResolvedValue({ kind: 'text', text: 'worker.example.com', elapsed: 1 });
    const { result, unmount } = renderHook(() => useAsyncRuleProcessing());
    expect(await result.current.processSort(bigText)).toBe('worker.example.com');
    unmount();
  });
});
