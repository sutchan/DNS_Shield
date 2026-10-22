// src/hooks/useLoading.test.ts v3.13.1
// @vitest-environment jsdom
// 加载编排契约：beforeLoad 短路、成功/失败/加载中三类提示、错误上下文日志、
// 以及 isLoading 在任何分支下都必定复位（避免按钮永久卡在 loading）。
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useLoading } from './useLoading';

describe('useLoading', () => {
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

  it('失败路径：调用 onError 并提示 errorToast，且不调用 onSuccess', async () => {
    const showToast = vi.fn();
    const onError = vi.fn();
    const onSuccess = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => {
          throw new Error('boom');
        },
        onSuccess,
        onError,
        errorToast: { key: 'failed', params: { reason: 'network' } }
      });
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('failed', { reason: 'network' });
    expect(result.current.isLoading).toBe(false);
    unmount();
  });

  it('失败路径未提供 errorToast 时静默（不产生提示）', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => {
          throw new Error('boom');
        }
      });
    });

    expect(showToast).not.toHaveBeenCalled();
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

  it('加载中亦提示 loading，失败时 loading 之后接 error', async () => {
    const showToast = vi.fn();
    const { result, unmount } = renderHook(() => useLoading(showToast));

    await act(async () => {
      await result.current.withLoading({
        fetchFn: async () => {
          throw new Error('boom');
        },
        loadingToast: { key: 'loading' },
        errorToast: { key: 'failed' }
      });
    });

    expect(showToast.mock.calls.map((c) => c[0])).toEqual(['loading', 'failed']);
    expect(result.current.isLoading).toBe(false);
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
