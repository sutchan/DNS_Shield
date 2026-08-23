// src/components/OutputPanel.tsx v3.7.68
'use client';
import * as React from 'react';
import { Sparkles, Download, Copy, Settings, FileCode } from 'lucide-react';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import SettingsPanel from './SettingsPanel';
import { Settings as SettingsType, FormatType, OutputContent, ParsedData } from '../types';
import { ALL_FORMATS, CORE_FORMATS } from '../types/formats';
import { useT } from '../context/AppContext';

interface OutputPanelProps {
  outputContent: OutputContent;
  currentFormat: FormatType;
  isSettingsPanelCollapsed: boolean;
  settings: SettingsType;
  parsedData: ParsedData;
  outputPreviewRef: React.RefObject<HTMLDivElement>;
  outputLineNumbersRef: React.RefObject<HTMLDivElement>;
  toggleSection: (section: string) => void;
  setFormat: (format: FormatType) => void;
  generateRules: () => void;
  downloadOutput: () => void;
  copyOutput: () => void;
  syncOutputScroll: () => void;
  updateSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

const OutputPanel: React.FC<OutputPanelProps> = React.memo(({
  outputContent,
  currentFormat,
  isSettingsPanelCollapsed,
  settings,
  parsedData,
  outputPreviewRef,
  outputLineNumbersRef,
  toggleSection,
  setFormat,
  generateRules,
  downloadOutput,
  copyOutput,
  syncOutputScroll,
  updateSettings,
  setSettings,
}) => {
  const t = useT();

  // 可见格式列表：showAllFormats 为 false 时仅展示核心 4 种（对齐原型「输出规则类型」显示/隐藏开关）
  const visibleFormats = React.useMemo<FormatType[]>(
    () => (settings.showAllFormats ? ALL_FORMATS : CORE_FORMATS),
    [settings.showAllFormats]
  );

  // 当前选中格式被隐藏时，回退到首个可见格式，避免空面板
  React.useEffect(() => {
    if (!visibleFormats.includes(currentFormat)) {
      setFormat(visibleFormats[0]);
    }
  }, [visibleFormats, currentFormat, setFormat]);

  const formatLabel: Record<FormatType, string> = {
    hosts: t.hostsFormat,
    dnsmasq: t.dnsmasqFormat,
    adguard: t.adguardFormat,
    whitelist: t.whitelistFormat,
    unbound: t.unboundFormat ?? t.hostsFormat,
    pihole: t.piholeFormat ?? t.hostsFormat,
    domains: t.domainsFormat ?? t.hostsFormat,
    bind: t.bindFormat ?? t.hostsFormat,
    smartdns: t.smartdnsFormat ?? t.hostsFormat,
  };

  return (
    <section className="panel" id="output-panel" aria-labelledby="output-title">
      <div className="output-body" id="output-body">
        <div className="output-header" id="output-header">
          <div className="panel-title" id="output-panel-title">
            <FileCode className="h-4 w-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
            <h2 id="output-title">{t.outputTitle}</h2>
          </div>
          <div className="output-toolbar" id="output-toolbar">
            <Tabs value={currentFormat} onValueChange={(v: string) => setFormat(v as FormatType)}>
              <TabsList className="format-tabs">
                {visibleFormats.map((fmt) => (
                  <TabsTrigger
                    key={fmt}
                    value={fmt}
                    id={`format-${fmt}-btn`}
                  >
                    {formatLabel[fmt]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              type="button"
              variant={'outline' as const}
              size={'icon' as const}
              onClick={() => toggleSection('settings-panel')}
              title={t.settingsTitle}
              id="settings-panel-toggle-btn"
              aria-expanded={!isSettingsPanelCollapsed}
              aria-controls="settings-panel"
            >
              <Settings className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <SettingsPanel
          isCollapsed={isSettingsPanelCollapsed}
          settings={settings}
          updateSettings={updateSettings}
          setSettings={setSettings}
        />

        {/* Merge Info */}
        <div className="output-stats" id="mergeInfo" role="status" aria-live="polite">
          {parsedData.domains.length > 0 || parsedData.whitelist.length > 0 || parsedData.customDns.length > 0 ? (
            <span>{t.mergeStats
              .replace('{blacklist}', String(parsedData.domains.length))
              .replace('{whitelist}', String(parsedData.whitelist.length))
              .replace('{customDns}', String(parsedData.customDns.length))}
            </span>
          ) : (
            t.mergeInfo
          )}
        </div>

        {/* 输出预览统计条（对齐原型 previewStats）：当前格式 / 规则行数 / 域名总数 / 格式数 */}
        <div className="preview-stats" id="preview-stats" aria-live="polite">
          <span className="preview-stat">
            <span className="text-muted-foreground">{t.psFormat}</span>
            <span className="preview-stat-value">{formatLabel[currentFormat]}</span>
          </span>
          <span className="preview-stat">
            <span className="preview-stat-value">{outputContent[currentFormat] ? outputContent[currentFormat].split('\n').length : 0}</span>
            <span className="text-muted-foreground">{t.psLines}</span>
          </span>
          <span className="preview-stat">
            <span className="preview-stat-value">{parsedData.domains.length + parsedData.whitelist.length + parsedData.customDns.length}</span>
            <span className="text-muted-foreground">{t.psDomains}</span>
          </span>
          <span className="preview-stat">
            <span className="preview-stat-value">{visibleFormats.length}</span>
            <span className="text-muted-foreground">{t.psFormats}</span>
          </span>
        </div>

        {/* Output Preview */}
        <div className="editor-wrapper" id="output-editor-wrapper">
          <div className="line-numbers" id="outputLineNumbers" ref={outputLineNumbersRef} aria-hidden="true"></div>
          {outputContent[currentFormat] ? (
            <div
              className="editor-preview"
              id="outputPreview"
              onScroll={syncOutputScroll}
              ref={outputPreviewRef}
              role="tabpanel"
              aria-label={t.outputFormatAria.replace('{format}', currentFormat)}
            >
              {/* 安全约束：outputContent 由 useRules 经 generateRulesUtil 生成，
                  其来源（sourceInput 域名、customDns 的 IP、设置项）均已在
                  parser.ts / domainValidator.ts / rulesGenerator.ts 中严格清洗与校验，
                  此处作为 React 文本节点渲染（非 dangerouslySetInnerHTML），不存在 XSS 面。
                  如后续放开任意文本注入，必须先经 sanitize 处理。 */}
              {outputContent[currentFormat]}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
              id="output-preview-empty"
              aria-label={t.previewPlaceholder}
            >
              <FileCode className="h-12 w-12 mb-4 opacity-40" strokeWidth={1.2} aria-hidden="true" />
              <p className="text-sm">{t.previewPlaceholder}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end" id="output-actions" role="group" aria-label={t.outputActionsAria}>
          <Button type="button" variant={'default' as const} onClick={generateRules} id="generate-rules-btn" className="font-semibold shadow-md">
            <Sparkles className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
            {t.generateBtn}
          </Button>
          <Button type="button" variant={'default' as const} onClick={downloadOutput} id="download-btn">
            <Download className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
            {t.downloadBtn}
          </Button>
          <Button type="button" variant={'outline' as const} onClick={copyOutput} id="copy-btn">
            <Copy className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
            {t.copyBtn}
          </Button>
        </div>
      </div>
    </section>
  );
});

export default OutputPanel;


