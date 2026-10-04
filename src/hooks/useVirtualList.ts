// src/hooks/useVirtualList.ts v3.11.0
// 轻量虚拟列表：仅渲染可视区域 + overscan 的行，配合固定行高使用。
// 面向「等宽等高」文本场景（行号列、规则预览），显著降低超长文本的
// DOM 节点数与首次布局/绘制成本。低于阈值的小文本直接全量渲染。

import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';

/** 与 globals.css 中 .editor-textarea / .editor-preview 的 line-height 保持一致 */
export const LINE_HEIGHT_PX = 24;

/** 小于该行数不启用虚拟化 */
const DEFAULT_THRESHOLD = 500;

interface UseVirtualListParams {
  itemCount: number;
  /** 滚动容器 ref，用于读取 scrollTop 与 clientHeight */
  containerRef: RefObject<HTMLElement>;
  overscan?: number;
  threshold?: number;
}

export const useVirtualList = ({
  itemCount,
  containerRef,
  overscan = 10,
  threshold = DEFAULT_THRESHOLD
}: UseVirtualListParams) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => setScrollTop(el.scrollTop);
    const measure = () => setViewportHeight(el.clientHeight);
    measure();
    el.addEventListener('scroll', handleScroll, { passive: true });
    // ResizeObserver 用于面板尺寸变化后重算可视行数；旧环境缺失时降级为仅滚动监听
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => {
        el.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }
    return () => el.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  // 视口高度未测量前（首帧）不启用虚拟化，避免内容闪烁
  const isVirtualized = itemCount >= threshold && viewportHeight > 0;

  const { startIndex, endIndex, offsetY, totalHeight } = useMemo(() => {
    const total = itemCount * LINE_HEIGHT_PX;
    if (!isVirtualized) {
      return { startIndex: 0, endIndex: itemCount, offsetY: 0, totalHeight: total };
    }
    const first = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT_PX) - overscan);
    const visibleCount = Math.ceil(viewportHeight / LINE_HEIGHT_PX) + overscan * 2;
    const last = Math.min(itemCount, first + visibleCount);
    return { startIndex: first, endIndex: last, offsetY: first * LINE_HEIGHT_PX, totalHeight: total };
  }, [itemCount, scrollTop, viewportHeight, isVirtualized, overscan]);

  /** 取出可视区间内的数据切片（未虚拟化时返回原数组） */
  const slice = useCallback(
    (items: string[]): string[] =>
      isVirtualized ? items.slice(startIndex, endIndex) : items,
    [isVirtualized, startIndex, endIndex]
  );

  return { isVirtualized, startIndex, endIndex, offsetY, totalHeight, slice };
};
