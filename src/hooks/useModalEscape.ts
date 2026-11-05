// src/hooks/useModalEscape.ts v3.15.0
// 弹窗栈：Escape 只关闭栈顶弹窗。
// 各弹窗此前各自监听 keydown，一次按键会同时命中 window 与 document 两个监听器，
// 导致叠放弹窗被一次性全部关闭（T-P1-16）。
'use client';
import { useEffect } from 'react';

interface ModalEntry {
  id: number;
  onClose: () => void;
}

const modalStack: ModalEntry[] = [];
let seq = 0;

/** 注册到弹窗栈；仅栈顶弹窗响应 Escape */
export function useModalEscape(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;
    const id = ++seq;
    modalStack.push({ id, onClose });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // 非栈顶弹窗不响应：避免一次 Escape 关闭多个弹窗
      if (modalStack[modalStack.length - 1]?.id !== id) return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const index = modalStack.findIndex((item) => item.id === id);
      if (index >= 0) modalStack.splice(index, 1);
    };
  }, [isOpen, onClose]);
}

/** 读取弹窗栈深度（供测试断言） */
export function getModalStackDepth(): number {
  return modalStack.length;
}
