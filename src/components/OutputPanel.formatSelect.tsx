// src/components/OutputPanel.formatSelect.tsx v3.15.5
// 格式切换控件：单一「格式」下拉菜单（DropdownMenu），覆盖全部可见格式。
// v3.15.5：替换原「核心 4 标签 + 更多格式下拉」混合布局（v3.15.2 引入），
// 12 种格式收敛到同一个下拉，不再有核心/高级两级入口，选择路径统一，
// 窄屏天然单行，彻底消除标签栏溢出覆盖工具按钮的问题（v3.15.4 线上实测重叠 155px）。
// 兼容说明：容器 id 仍为 output-format-controls；原 output-format-tabs /
// format-more-btn / format-more-menu / format-more-item-{fmt} 由
// output-format-select-btn / output-format-menu / format-item-{fmt} 取代。
'use client';
import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { FormatType } from '../types';

export interface FormatSelectProps {
  currentFormat: FormatType;
  visibleFormats: FormatType[];
  formatLabel: Record<FormatType, string>;
  onFormatChange: (format: FormatType) => void;
}

export const FormatSelect: FC<FormatSelectProps> = ({
  currentFormat,
  visibleFormats,
  formatLabel,
  onFormatChange,
}) => (
  <div className="format-controls" id="output-format-controls">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={'outline' as const}
          size="sm"
          id="output-format-select-btn"
          className="format-select-trigger"
          aria-haspopup="menu"
        >
          <span className="max-w-[12rem] truncate">{formatLabel[currentFormat]}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 flex-shrink-0" strokeWidth={1.8} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" id="output-format-menu" className="max-h-[60vh] overflow-y-auto">
        <DropdownMenuRadioGroup
          value={currentFormat}
          onValueChange={(v: string) => onFormatChange(v as FormatType)}
        >
          {visibleFormats.map((fmt) => (
            <DropdownMenuRadioItem key={fmt} value={fmt} id={`format-item-${fmt}`}>
              {formatLabel[fmt]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
