// src/hooks/useVirtualList.test.ts v3.12.0
// @vitest-environment jsdom
// 虚拟列表的切片数学：阈值以下全量返回；阈值以上按行高换算可视区间并叠加 overscan。
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useVirtualList, LINE_HEIGHT_PX } from './useVirtualList';

afterEach(() => {
  document.body.innerHTML = '';
});

/** 造一个高度可测量的滚动容器 */
function makeContainer(height: number) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
  document.body.appendChild(el);
  return { current: el };
}

describe('useVirtualList', () => {
  it('行数低于阈值时不虚拟化，返回全部数据', () => {
    const items = Array.from({ length: 10 }, (_, i) => 'line-' + i);
    const { result, unmount } = renderHook(() =>
      useVirtualList({ itemCount: items.length, containerRef: makeContainer(480) })
    );
    expect(result.current.isVirtualized).toBe(false);
    expect(result.current.slice(items)).toEqual(items);
    expect(result.current.totalHeight).toBe(items.length * LINE_HEIGHT_PX);
    unmount();
  });

  it('视口高度未测量前不虚拟化（避免首帧闪烁）', () => {
    const { result, unmount } = renderHook(() =>
      useVirtualList({ itemCount: 1000, containerRef: makeContainer(0) })
    );
    expect(result.current.isVirtualized).toBe(false);
    expect(result.current.startIndex).toBe(0);
    unmount();
  });

  it('超过阈值后仅返回可视区切片', () => {
    const items = Array.from({ length: 1000 }, (_, i) => 'line-' + i);
    const { result, unmount } = renderHook(() =>
      useVirtualList({ itemCount: items.length, containerRef: makeContainer(240), overscan: 2 })
    );
    expect(result.current.isVirtualized).toBe(true);
    expect(result.current.slice(items).length).toBeLessThan(items.length);
    expect(result.current.totalHeight).toBe(1000 * LINE_HEIGHT_PX);
    unmount();
  });

  it('滚动后切片起点随 scrollTop 前移', () => {
    const items = Array.from({ length: 1000 }, (_, i) => 'line-' + i);
    const containerRef = makeContainer(240);
    const { result, unmount } = renderHook(() =>
      useVirtualList({ itemCount: items.length, containerRef, overscan: 0 })
    );
    act(() => {
      containerRef.current.scrollTop = LINE_HEIGHT_PX * 10; // 第 10 行（行高 24px）
      containerRef.current.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.startIndex).toBe(10);
    expect(result.current.slice(items)[0]).toBe('line-10');
    unmount();
  });
});
