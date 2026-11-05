// src/hooks/useModalA11y.ts v3.15.0
// 模态对话框无障碍 Hook：打开时锁定 body 滚动、自动聚焦关闭按钮、Esc 关闭、Tab 焦点陷阱。
// 从 SettingsPanel 抽离以保持主文件 ≤200 行，公开交互契约不变。
import * as React from 'react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { useModalEscape } from './useModalEscape';

export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  // Esc 统一交由弹窗栈处理：仅栈顶弹窗响应，避免叠放弹窗被一次按键全关（T-P1-16）
  useModalEscape(isOpen, onClose);

  React.useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    // 共享引用计数滚动锁：与其他弹窗叠放时互不破坏（T-P1-17）
    lockScroll();
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      prevFocus?.focus?.();
    };
  }, [isOpen]);

  return { dialogRef, closeBtnRef };
}
