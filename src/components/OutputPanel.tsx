// src/components/OutputPanel.tsx v3.7.2
'use client';
import * as React from 'react';
import { Sparkles, Download, Copy, Settings, FileCode } from 'lucide-react';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import SettingsPanel from './SettingsPanel';
import { Settings as SettingsType, FormatType, OutputContent, ParsedData } from '../types';
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

const OutputPanel: React.FC<OutputPanelProps> = ({
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
  return (
    <section className="panel" id="output-panel" aria-labelledby="output-title">
      <div className="output-body">
        <div className="output-header">
          <div className="panel-title">
            <FileCode className="h-4 w-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
            <h2 id="output-title">{t.outputTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={currentFormat} onValueChange={(v) => setFormat(v as FormatType)}>
              <TabsList className="format-tabs">
                <TabsTrigger value="hosts" id="format-hosts-btn">{t.hostsFormat}</TabsTrigger>
                <TabsTrigger value="dnsmasq" id="format-dnsmasq-btn">{t.dnsmasqFormat}</TabsTrigger>
                <TabsTrigger value="adguard" id="format-adguard-btn">{t.adguardFormat}</TabsTrigger>
                <TabsTrigger value="whitelist" id="format-whitelist-btn">{t.whitelistFormat}</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              type="button"
              variant="outline"
              size="icon"
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
          {outputContent[currentFormat] ? (
            <span>{t.mergeStats
              .replace('{blacklist}', String(parsedData.domains.length))
              .replace('{whitelist}', String(parsedData.whitelist.length))
              .replace('{customDns}', String(parsedData.customDns.length))}
            </span>
          ) : (
            t.mergeInfo
          )}
        </div>

        {/* Output Preview */}
        <div className="editor-wrapper">
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
              aria-label={t.previewPlaceholder}
            >
              <FileCode className="h-12 w-12 mb-4 opacity-40" strokeWidth={1.2} aria-hidden="true" />
              <p className="text-sm">{t.previewPlaceholder}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end" id="output-actions" role="group" aria-label={t.outputActionsAria}>
          <Button type="button" variant="default" onClick={generateRules} id="generate-rules-btn">
            <Sparkles className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
            {t.generateBtn}
          </Button>
          <Button type="button" variant="default" onClick={downloadOutput} id="download-btn">
            <Download className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
            {t.downloadBtn}
          </Button>
          <Button type="button" variant="outline" onClick={copyOutput} id="copy-btn">
            <Copy className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
            {t.copyBtn}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OutputPanel;
