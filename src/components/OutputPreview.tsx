// src/components/OutputPreview.tsx v3.11.0
// 输出预览区：对超长规则文本启用虚拟渲染（仅挂载可视区切片），
// 显著降低 DOM 内存与首次布局/绘制成本；行数较少时保持原有整体渲染，
// 保留自动换行与文本选择的既有体验。

import { useMemo, type FC } from 'react';
import { useVirtualList } from '../hooks/useVirtualList';

interface OutputPreviewProps {
  /** 当前格式的完整输出文本 */
  content: string;
  /** 滚动容器 ref：供虚拟列表读取 scrollTop，并供外部同步行号列 */
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  id: string;
  ariaLabel: string;
}

export const OutputPreview: FC<OutputPreviewProps> = ({
  content,
  scrollRef,
  onScroll,
  id,
  ariaLabel
}) => {
  const lines = useMemo(() => (content ? content.split('\n') : []), [content]);
  const { isVirtualized, startIndex, offsetY, totalHeight, slice } = useVirtualList({
    itemCount: lines.length,
    containerRef: scrollRef
  });

  // 小文本：保持原有整体渲染（自动换行 + 可选中复制）
  if (!isVirtualized) {
    return (
      <div
        className="editor-preview"
        id={id}
        onScroll={onScroll}
        ref={scrollRef}
        role="tabpanel"
        aria-label={ariaLabel}
      >
        {content}
      </div>
    );
  }

  // 大文本：仅挂载可视区切片，容器高度保持总高度以维持滚动条比例
  const visible = slice(lines);

  return (
    <div
      className="editor-preview is-virtualized"
      id={id}
      onScroll={onScroll}
      ref={scrollRef}
      role="tabpanel"
      aria-label={ariaLabel}
    >
      <div className="preview-virtual" style={{ height: totalHeight }}>
        <div className="preview-virtual-rows" style={{ transform: 'translateY(' + offsetY + 'px)' }}>
          {visible.map((line, index) => (
            <div className="preview-line" key={startIndex + index}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
