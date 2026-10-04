// src/components/OutputPanel.tsx v3.10.2
// 输出面板：编排格式切换 / 设置弹窗 / 规则测试 / 路由器脚本 / 预览 / 操作按钮。
// 纯展示子组件与派生逻辑已抽离至 OutputPanel.parts.tsx 以保持主文件 ≤200 行。
'use client';
import * as React from 'react';
import SettingsPanel from './SettingsPanel';
import RuleTesterModal from './RuleTesterModal';
import ScriptGeneratorModal from './ScriptGeneratorModal';
import {
  FormatTabs,
  PreviewStats,
  OutputToolbar,
  OutputActions,
} from './OutputPanel.parts';
import { buildFormatLabel, useVisibleFormats } from './OutputPanel.derived';
import { Settings as SettingsType, FormatType, OutputContent, ParsedData } from '../types';
import { useT } from '../context/AppContext';

interface OutputPanelProps {
  outputContent: OutputContent;
  currentFormat: FormatType;
  isSettingsOpen: boolean;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  settings: SettingsType;
  parsedData: ParsedData;
  outputPreviewRef: React.RefObject<HTMLDivElement>;
  outputLineNumbersRef: React.RefObject<HTMLDivElement>;
  setFormat: (format: FormatType) => void;
  generateRules: () => void;
  downloadOutput: () => void;
  copyOutput: () => void;
  syncOutputScroll: () => void;
  updateSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showToast?: (key: string) => void;
}

const OutputPanel: React.FC<OutputPanelProps> = React.memo(({
  outputContent,
  currentFormat,
  isSettingsOpen,
  onOpenSettings,
  onCloseSettings,
  settings,
  parsedData,
  outputPreviewRef,
  outputLineNumbersRef,
  setFormat,
  generateRules,
  downloadOutput,
  copyOutput,
  syncOutputScroll,
  updateSettings,
  setSettings,
  theme,
  toggleTheme,
  showToast = () => {},
}) => {
  const t = useT();
  const [isRuleTesterOpen, setIsRuleTesterOpen] = React.useState(false);
  const [isScriptGenOpen, setIsScriptGenOpen] = React.useState(false);

  // 可见格式列表：结合 showAllFormats（全部/核心）与 visibleFormats（逐格式显示/隐藏开关）。
  const visibleFormats = useVisibleFormats(settings, outputContent);
  // 各输出格式的展示标签。
  const formatLabel = buildFormatLabel(t);

  // 当前选中格式被隐藏时，回退到首个可见格式，避免空面板
  React.useEffect(() => {
    if (!visibleFormats.includes(currentFormat)) {
      setFormat(visibleFormats[0]);
    }
  }, [visibleFormats, currentFormat, setFormat]);

  const ruleLines = outputContent[currentFormat] ? outputContent[currentFormat].split('\n').length : 0;
  const domainTotal = parsedData.domains.length + parsedData.whitelist.length + parsedData.customDns.length;

  return (
    <section className="panel" id="output-panel" aria-labelledby="output-title">
      <div className="output-body" id="output-body">
        <div className="output-header" id="output-header">
          <div className="panel-title" id="output-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>
            <h2 id="output-title">{t.outputTitle}</h2>
          </div>
          <OutputToolbar
            t={t}
            onOpenRuleTester={() => setIsRuleTesterOpen(true)}
            onOpenScriptGen={() => setIsScriptGenOpen(true)}
            onOpenSettings={onOpenSettings}
            isSettingsOpen={isSettingsOpen}
          />
        </div>

        {/* Settings Panel（L2：居中弹窗 modal） */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={onCloseSettings}
          settings={settings}
          theme={theme}
          toggleTheme={toggleTheme}
          updateSettings={updateSettings}
          setSettings={setSettings}
        />

        {/* 规则测试器弹窗 */}
        <RuleTesterModal
          open={isRuleTesterOpen}
          onClose={() => setIsRuleTesterOpen(false)}
          parsedData={parsedData}
        />

        {/* 路由器同步脚本弹窗 */}
        <ScriptGeneratorModal
          open={isScriptGenOpen}
          onClose={() => setIsScriptGenOpen(false)}
          showToast={showToast}
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

        {/* 输出预览统计条 */}
        <PreviewStats
          currentFormat={currentFormat}
          formatLabel={formatLabel}
          ruleLines={ruleLines}
          domainTotal={domainTotal}
          formatCount={visibleFormats.length}
          t={{ psFormat: t.psFormat, psLines: t.psLines, psDomains: t.psDomains, psFormats: t.psFormats }}
        />

        {/* Output Preview */}
        <div className="editor-wrapper" id="output-preview-area">
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
              {outputContent[currentFormat]}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
              id="output-preview-empty"
              aria-label={t.previewPlaceholder}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>
              <p className="text-sm">{t.previewPlaceholder}</p>
            </div>
          )}
        </div>

        <OutputActions
          t={t}
          onGenerate={generateRules}
          onDownload={downloadOutput}
          onCopy={copyOutput}
        />
      </div>
    </section>
  );
});
OutputPanel.displayName = 'OutputPanel';

export default OutputPanel;
