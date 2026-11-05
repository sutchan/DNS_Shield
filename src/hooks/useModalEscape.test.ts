// src/hooks/useModalEscape.test.ts v3.15.0
// @vitest-environment jsdom
// 弹窗栈契约（T-P1-16）：一次 Escape 只关闭栈顶弹窗，
// 叠放的多层弹窗不会被同一个按键一次性全部关闭。
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '../test-utils/renderHook';
import { useModalEscape, getModalStackDepth } from './useModalEscape';

describe('useModalEscape', () => {
  it('未打开时不注册监听，也不响应 Escape', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalEscape(false, onClose));
    expect(getModalStackDepth()).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });

  it('打开时 Escape 触发 onClose', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalEscape(true, onClose));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('叠放两个弹窗时，一次 Escape 只关闭栈顶弹窗', () => {
    const outerClose = vi.fn();
    const innerClose = vi.fn();
    const outer = renderHook(() => useModalEscape(true, outerClose));
    const inner = renderHook(() => useModalEscape(true, innerClose));
    expect(getModalStackDepth()).toBe(2);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(innerClose).toHaveBeenCalledTimes(1);
    expect(outerClose).not.toHaveBeenCalled();
    inner.unmount();
    outer.unmount();
  });

  it('关闭栈顶后，下一次 Escape 作用于下一个弹窗', () => {
    const outerClose = vi.fn();
    const innerClose = vi.fn();
    const outer = renderHook(() => useModalEscape(true, outerClose));
    const inner = renderHook(() => useModalEscape(true, innerClose));

    inner.unmount();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(outerClose).toHaveBeenCalledTimes(1);
    expect(innerClose).not.toHaveBeenCalled();
    outer.unmount();
  });

  it('非 Escape 按键不触发关闭', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalEscape(true, onClose));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });
});
