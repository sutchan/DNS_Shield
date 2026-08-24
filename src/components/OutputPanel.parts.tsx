// src/components/OutputPanel.parts.tsx v3.9.0
// OutputPanel 的纯展示子组件：格式切换标签栏与预览统计条。
// 从 OutputPanel 抽离以保持主文件 ≤200 行，遵循「组件文件拆分」规范。

import type { FC } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { FormatType } from '../types';

interface FormatTabsProps {
  currentFormat: FormatType;
  visibleFormats: FormatType[];
  formatLabel: Record<FormatType, string>;
  onFormatChange: (format: FormatType) => void;
}

// 格式切换标签栏：点击切换输出格式，对齐原型「输出规则类型」显示/隐藏开关
export const FormatTabs: FC<FormatTabsProps> = ({
  currentFormat,
  visibleFormats,
  formatLabel,
  onFormatChange,
}) => (
  <Tabs value={currentFormat} onValueChange={(v: string) => onFormatChange(v as FormatType)}>
    <TabsList className="format-tabs" id="output-format-tabs">
      {visibleFormats.map((fmt) => (
        <TabsTrigger key={fmt} value={fmt} id={`format-${fmt}-btn`}>
          {formatLabel[fmt]}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

interface PreviewStatsProps {
  currentFormat: FormatType;
  formatLabel: Record<FormatType, string>;
  ruleLines: number;
  domainTotal: number;
  formatCount: number;
  t: {
    psFormat: string;
    psLines: string;
    psDomains: string;
    psFormats: string;
  };
}

// 输出预览统计条：当前格式 / 规则行数 / 域名总数 / 可见格式数
export const PreviewStats: FC<PreviewStatsProps> = ({
  currentFormat,
  formatLabel,
  ruleLines,
  domainTotal,
  formatCount,
  t,
}) => (
  <div className="preview-stats" id="preview-stats" aria-live="polite">
    <span className="preview-stat">
      <span className="text-muted-foreground">{t.psFormat}</span>
      <span className="preview-stat-value">{formatLabel[currentFormat]}</span>
    </span>
    <span className="preview-stat">
      <span className="preview-stat-value">{ruleLines}</span>
      <span className="text-muted-foreground">{t.psLines}</span>
    </span>
    <span className="preview-stat">
      <span className="preview-stat-value">{domainTotal}</span>
      <span className="text-muted-foreground">{t.psDomains}</span>
    </span>
    <span className="preview-stat">
      <span className="preview-stat-value">{formatCount}</span>
      <span className="text-muted-foreground">{t.psFormats}</span>
    </span>
  </div>
);
