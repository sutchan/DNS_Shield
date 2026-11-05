// src/utils/scrollLock.ts v3.15.0
// 共享滚动锁：多弹窗叠放时以引用计数管理 body 滚动。
// 各弹窗此前直接写 body.style.overflow，会导致「关闭内层弹窗把外层弹窗的滚动锁
// 一并解除」（背景页面滚动穿透）或「全部关闭后页面仍永久不可滚动」（T-P1-17）。

let lockCount = 0;
let previousOverflow = '';

/** 锁定 body 滚动（可嵌套调用，计数 +1） */
export function lockScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

/** 释放一次滚动锁；全部释放后恢复原始 overflow */
export function unlockScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
    previousOverflow = '';
  }
}

/** 读取当前锁状态（供测试断言） */
export function getScrollLockState(): { count: number; previousOverflow: string } {
  return { count: lockCount, previousOverflow };
}
