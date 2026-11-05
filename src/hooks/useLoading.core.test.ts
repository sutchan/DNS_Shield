// src/hooks/useLoading.core.test.ts v3.15.0
// @vitest-environment jsdom
// 加载编排契约（成功/短路/顺序/状态复位）：beforeLoad 短路、successToast 参数、
// loading → success 提示顺序，以及 isLoading 在任何分支下都必定复位
// （避免按钮永久卡在 loading）。
// （原 useLoading.test.ts 按关注点拆分，本文件承接核心流程分组）
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useLoading } from './useLoading';

describe('useLoading · 核心流程', () => {
  it('初始为非加载态', () => {
    const { result, unmount } = renderHook(() => useLoading(vi.fn()));
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('成功路径：调用 onSuccess 并提示 successToast', async () => {
    const showToast = vi.fn();
    const onSuccess = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => 'payload',
        onSuccess,
        successToast: { key: 'ok' }
      });
    });

    expect(onSuccess).toHaveBeenCalledWith('payload');
    expect(showToast).toHaveBeenCalledWith('ok', undefined);
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('成功路径可携带提示参数', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => 1,
        successToast: { key: 'loaded', params: { count: 5 } }
      });
    });

    expect(showToast).toHaveBeenCalledWith('loaded', { count: 5 });
    unmount();
  });

  it('beforeLoad 返回 false 时短路：不执行 fetchFn、不提示任何 toast', async () => {
    const showToast = vi.fn();
    const fetchFn = vi.fn(async () => 'x');
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn,
        beforeLoad: () => false,
        successToast: { key: 'ok' },
        loadingToast: { key: 'loading' }
      });
    });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('beforeLoad 返回 true / undefined 时正常继续', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({ fetchFn: async () => 1, beforeLoad: () => true });
    });
    expect(showToast).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.withLoading({ fetchFn: async () => 2, beforeLoad: () => undefined });
    });
    unmount();
  });

  it('先提示 loading 再提示 success（顺序契约）', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => 'x',
        loadingToast: { key: 'loading' },
        successToast: { key: 'done' }
      });
    });

    expect(showToast.mock.calls.map((c) => c[0])).toEqual(['loading', 'done']);
    unmount();
  });

  it('加载期间 isLoading 为 true，结束后复位', async () => {
    let release!: (v: string) => void;
    const { result, unmount } = renderHook(() => useLoading(vi.fn()));

    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.withLoading({
        fetchFn: () => new Promise<string>((r) => {
          release = r;
        })
      });
      await Promise.resolve();
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      release('done');
      await pending;
    });
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('无 onSuccess 时仅取结果不抛错', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => 'x',
        successToast: { key: 'ok' }
      });
    });

    expect(showToast).toHaveBeenCalledWith('ok', undefined);
    unmount();
  });

  it('errorContext 缺省时也能兜住错误（不外抛）', async () => {
    const { result, unmount } = renderHook(() => useLoading(vi.fn()));

    await expect(
      act(async () => {
        await result.current.withLoading({
          fetchFn: async () => {
            throw new Error('no-context');
          }
        });
      })
    ).resolves.toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    unmount();
  });
});
