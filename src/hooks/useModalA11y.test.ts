// src/hooks/useModalA11y.test.ts v3.12.0
// @vitest-environment jsdom
// 模态无障碍契约：body 滚动锁定、Esc 关闭、卸载还原、Tab 焦点陷阱。
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '../test-utils/renderHook';
import { useModalA11y } from './useModalA11y';

afterEach(() => {
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

/** 构造一个含可聚焦元素的对话框，挂到 document 上 */
function mountDialog() {
  document.body.innerHTML =
    '<div id="dlg"><button id="first">first</button><input id="mid" /><button id="close">close</button></div>';
  return {
    first: document.getElementById('first') as HTMLButtonElement,
    close: document.getElementById('close') as HTMLButtonElement
  };
}

describe('useModalA11y', () => {
  it('未打开时不锁定 body 滚动、不响应 Esc', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalA11y(false, onClose));
    expect(document.body.style.overflow).toBe('');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });

  it('打开时锁定 body 滚动', () => {
    const { unmount } = renderHook(() => useModalA11y(true, vi.fn()));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
  });

  it('Esc 触发 onClose', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalA11y(true, onClose));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('卸载时还原 body 滚动状态', () => {
    const { unmount } = renderHook(() => useModalA11y(true, vi.fn()));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('Tab 在最后一个可聚焦元素上回绕到第一个', () => {
    const { first, close } = mountDialog();
    const { result, unmount } = renderHook(() => useModalA11y(true, vi.fn()));
    const dialogRef = result.current.dialogRef as { current: HTMLDivElement | null };
    dialogRef.current = document.getElementById('dlg');
    close.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    document.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
    unmount();
  });
});
