// src/utils/scrollLock.test.ts v3.15.0
// @vitest-environment jsdom
// 共享滚动锁契约（T-P1-17）：多弹窗叠放时以引用计数管理 body 滚动，
// 关闭内层弹窗不得解除外层弹窗的锁定，全部关闭后必须恢复原始 overflow。
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { lockScroll, unlockScroll, getScrollLockState } from './scrollLock';

beforeEach(() => {
  document.body.style.overflow = '';
});

afterEach(() => {
  // 清空计数，避免用例间互相影响
  while (getScrollLockState().count > 0) unlockScroll();
  document.body.style.overflow = '';
});

describe('scrollLock', () => {
  it('首次加锁把 body 滚动置为 hidden', () => {
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    expect(getScrollLockState().count).toBe(1);
  });

  it('嵌套加锁时计数递增且保持 hidden', () => {
    lockScroll();
    lockScroll();
    expect(getScrollLockState().count).toBe(2);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('释放一次不会解除其它弹窗的锁定', () => {
    lockScroll();
    lockScroll();
    unlockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    expect(getScrollLockState().count).toBe(1);
  });

  it('全部释放后恢复加锁前的 overflow', () => {
    document.body.style.overflow = 'scroll';
    lockScroll();
    lockScroll();
    unlockScroll();
    unlockScroll();
    expect(document.body.style.overflow).toBe('scroll');
    expect(getScrollLockState().count).toBe(0);
  });

  it('计数为 0 时多余释放不抛错且不污染状态', () => {
    unlockScroll();
    expect(getScrollLockState().count).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });
});
