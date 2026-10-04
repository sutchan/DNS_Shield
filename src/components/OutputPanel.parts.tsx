// src/components/OutputPanel.parts.tsx v3.11.1
// OutputPanel 的纯展示子组件：格式切换标签栏、预览统计条、工具栏与操作按钮。
// 派生逻辑（格式标签映射 / 可见格式计算）已抽离至 OutputPanel.derived.ts 以保持本文件 ≤200 行。

import type { FC, ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Button } from './ui/Button';
import { SearchCheck, Terminal, Settings as SettingsIcon, Sparkles, Download, Copy } from 'lucide-react';
import { FormatType } from '../types';
import type { Translation } from '../types/translation';

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

interface OutputToolbarProps {
  t: Translation;
  onOpenRuleTester: () => void;
  onOpenScriptGen: () => void;
  onOpenSettings: () => void;
  isSettingsOpen: boolean;
  /** 工具栏左侧插槽：格式切换标签栏（保持与 v3.10.0 一致的 DOM 顺序） */
  children?: ReactNode;
}

// 输出面板顶部工具栏：格式切换标签栏 + 规则测试 / 路由器脚本 / 设置三个图标按钮。
export const OutputToolbar: FC<OutputToolbarProps> = ({
  t,
  onOpenRuleTester,
  onOpenScriptGen,
  onOpenSettings,
  isSettingsOpen,
  children,
}) => (
  <div className="output-toolbar flex items-center gap-1.5" id="output-toolbar">
    {children}
    <Button
      type="button"
      variant={'outline' as const}
      size={'icon' as const}
      onClick={onOpenRuleTester}
      title={t.ruleTesterTitle}
      id="rule-tester-toggle-btn"
      aria-label={t.ruleTesterTitle}
    >
      <SearchCheck className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
    </Button>
    <Button
      type="button"
      variant={'outline' as const}
      size={'icon' as const}
      onClick={onOpenScriptGen}
      title={t.routerScriptTitle}
      id="router-script-toggle-btn"
      aria-label={t.routerScriptTitle}
    >
      <Terminal className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
    </Button>
    <Button
      type="button"
      variant={'outline' as const}
      size={'icon' as const}
      onClick={onOpenSettings}
      title={t.settingsTitle}
      id="settings-panel-toggle-btn"
      aria-expanded={isSettingsOpen}
      aria-controls="settings-panel"
    >
      <SettingsIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
    </Button>
  </div>
);

interface OutputActionsProps {
  t: Translation;
  onGenerate: () => void;
  onDownload: () => void;
  onCopy: () => void;
}

// 输出面板底部操作按钮：生成 / 下载 / 复制。
export const OutputActions: FC<OutputActionsProps> = ({
  t,
  onGenerate,
  onDownload,
  onCopy,
}) => (
  <div className="flex flex-wrap gap-2 justify-end" id="output-actions" role="group" aria-label={t.outputActionsAria}>
    <Button type="button" variant={'default' as const} onClick={onGenerate} id="generate-rules-btn" className="font-semibold shadow-md">
      <Sparkles className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
      {t.generateBtn}
    </Button>
    <Button type="button" variant={'default' as const} onClick={onDownload} id="download-btn">
      <Download className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
      {t.downloadBtn}
    </Button>
    <Button type="button" variant={'outline' as const} onClick={onCopy} id="copy-btn">
      <Copy className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
      {t.copyBtn}
    </Button>
  </div>
);
