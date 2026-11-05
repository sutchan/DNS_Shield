// src/hooks/useLoading.error.test.ts v3.15.0
// @vitest-environment jsdom
// 加载编排契约（失败分支）：onError 回调、errorToast 提示与参数、
// loading → error 提示顺序；失败时 onSuccess 不得被调用且 isLoading 必须复位。
// （原 useLoading.test.ts 按关注点拆分，本文件承接失败分支分组）
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useLoading } from './useLoading';

describe('useLoading · 失败分支', () => {
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
});
