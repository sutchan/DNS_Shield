// src/components/OutputPanel.formatTabs.tsx v3.15.2
// 格式切换控件：核心格式（CORE_FORMATS）以标签直接切换，其余高级格式收进「更多格式」下拉。
// v3.15.2 起不再把 12 个格式平铺成标签（窄屏会换行堆叠成两列），
// 改为「核心 4 标签 + 更多下拉」，保持单行整洁并保留快速切换能力。
'use client';
import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { FormatType } from '../types';
import { CORE_FORMATS } from '../types/formats';

export interface FormatTabsProps {
  currentFormat: FormatType;
  visibleFormats: FormatType[];
  formatLabel: Record<FormatType, string>;
  onFormatChange: (format: FormatType) => void;
  /** 「更多格式」下拉的本地化标签 */
  moreFormatsLabel: string;
}

const CORE_SET: ReadonlySet<FormatType> = new Set(CORE_FORMATS);

export const FormatTabs: FC<FormatTabsProps> = ({
  currentFormat,
  visibleFormats,
  formatLabel,
  onFormatChange,
  moreFormatsLabel,
}) => {
  const coreFormats = visibleFormats.filter((fmt) => CORE_SET.has(fmt));
  const extraFormats = visibleFormats.filter((fmt) => !CORE_SET.has(fmt));
  const activeExtra = extraFormats.includes(currentFormat) ? currentFormat : null;

  return (
    <div className="format-controls" id="output-format-controls">
      <Tabs value={currentFormat} onValueChange={(v: string) => onFormatChange(v as FormatType)}>
        <TabsList className="format-tabs" id="output-format-tabs">
          {coreFormats.map((fmt) => (
            <TabsTrigger key={fmt} value={fmt} id={`format-${fmt}-btn`}>
              {formatLabel[fmt]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {extraFormats.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={activeExtra ? ('default' as const) : ('outline' as const)}
              size="sm"
              id="format-more-btn"
              className="format-more-trigger"
              aria-haspopup="menu"
              aria-label={`${moreFormatsLabel}（${extraFormats.length}）`}
            >
              <span className="max-w-[10rem] truncate">
                {activeExtra ? formatLabel[activeExtra] : moreFormatsLabel}
              </span>
              <ChevronDown className="h-3.5 w-3.5 ml-1 flex-shrink-0" strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" id="format-more-menu" className="max-h-[60vh] overflow-y-auto">
            <DropdownMenuRadioGroup
              value={currentFormat}
              onValueChange={(v: string) => onFormatChange(v as FormatType)}
            >
              {extraFormats.map((fmt) => (
                <DropdownMenuRadioItem key={fmt} value={fmt} id={`format-more-item-${fmt}`}>
                  {formatLabel[fmt]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
