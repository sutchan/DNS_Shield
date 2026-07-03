// src/components/OutputPanel.tsx v3.2.0
'use client';
import * as React from 'react';
import { Sparkles, Download, Copy, Settings, ChevronDown, FileCode } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Settings as SettingsType, Translation, FormatType, OutputContent, ParsedData } from '../types';

interface OutputPanelProps {
  outputContent: OutputContent;
  currentFormat: FormatType;
  isSettingsPanelCollapsed: boolean;
  settings: SettingsType;
  parsedData: ParsedData;
  t: Translation;
  isLangZh: boolean;
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
  t,
  isLangZh,
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
  return (
    <section className="panel" id="output-panel" aria-labelledby="output-title">
      <div className="output-body">
        <div className="output-header">
          <div className="panel-title">
            <FileCode className="h-4 w-4 text-primary" strokeWidth={1.8} />
            <h2 id="output-title">{t.outputTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={currentFormat} onValueChange={(v) => setFormat(v as FormatType)}>
              <TabsList className="format-tabs">
                <TabsTrigger value="hosts" id="format-hosts-btn">Hosts</TabsTrigger>
                <TabsTrigger value="dnsmasq" id="format-dnsmasq-btn">Dnsmasq</TabsTrigger>
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
              <Settings className="h-4 w-4" strokeWidth={1.8} />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <div
          className={`settings-panel ${isSettingsPanelCollapsed ? 'settings-collapsed' : 'settings-expanded'}`}
          id="settings-panel"
          aria-hidden={isSettingsPanelCollapsed}
        >
          <div className="settings-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="projectNameInput" className="text-xs font-medium text-muted-foreground">{t.projectName}</Label>
                <Input
                  type="text"
                  id="projectNameInput"
                  defaultValue={settings.projectName}
                  onChange={updateSettings}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="versionInput" className="text-xs font-medium text-muted-foreground">{t.version}</Label>
                <Input
                  type="text"
                  id="versionInput"
                  defaultValue={settings.version}
                  onChange={updateSettings}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ipv4Input" className="text-xs font-medium text-muted-foreground">{t.ipV4}</Label>
                <Input
                  type="text"
                  id="ipv4Input"
                  defaultValue={settings.ipv4}
                  onChange={updateSettings}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ipv6Input" className="text-xs font-medium text-muted-foreground">{t.ipV6}</Label>
                <Input
                  type="text"
                  id="ipv6Input"
                  defaultValue={settings.ipv6}
                  onChange={updateSettings}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  id="addHeader"
                  checked={settings.addHeader}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, addHeader: checked === true }))}
                />
                <Label htmlFor="addHeader" className="text-sm text-muted-foreground cursor-pointer">{t.headerComment}</Label>
              </div>
              <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  id="blockIPv6"
                  checked={settings.blockIPv6}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, blockIPv6: checked === true }))}
                />
                <Label htmlFor="blockIPv6" className="text-sm text-muted-foreground cursor-pointer">{t.blockIPv6}</Label>
              </div>
              <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  id="dedupDomains"
                  checked={settings.dedupDomains}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, dedupDomains: checked === true }))}
                />
                <Label htmlFor="dedupDomains" className="text-sm text-muted-foreground cursor-pointer">{t.dedup}</Label>
              </div>
              <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  id="removeWildcard"
                  checked={settings.removeWildcard}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, removeWildcard: checked === true }))}
                />
                <Label htmlFor="removeWildcard" className="text-sm text-muted-foreground cursor-pointer">{t.removeWildcard}</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Merge Info */}
        <div className="output-stats" id="mergeInfo" role="status" aria-live="polite">
          {outputContent[currentFormat] ? (
            <span>{isLangZh ?
              `黑名单: ${parsedData.domains.length} | 白名单: ${parsedData.whitelist.length} | 自定义DNS: ${parsedData.customDns.length}` :
              `Blacklist: ${parsedData.domains.length} | Whitelist: ${parsedData.whitelist.length} | Custom DNS: ${parsedData.customDns.length}`}
            </span>
          ) : (
            t.mergeInfo
          )}
        </div>

        {/* Output Preview */}
        <div className="editor-wrapper">
          <div className="line-numbers" id="outputLineNumbers" ref={outputLineNumbersRef} aria-hidden="true"></div>
          <div
            className="editor-textarea overflow-auto whitespace-pre-wrap"
            id="outputPreview"
            onScroll={syncOutputScroll}
            ref={outputPreviewRef}
            role="tabpanel"
            aria-label={`${currentFormat} 格式输出`}
          >
            {outputContent[currentFormat] || t.previewPlaceholder}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end" id="output-actions" role="group" aria-label="输出操作">
          <Button type="button" variant="default" onClick={generateRules} id="generate-rules-btn">
            <Sparkles className="h-4 w-4 mr-1" strokeWidth={1.8} />
            {t.generateBtn}
          </Button>
          <Button type="button" variant="default" onClick={downloadOutput} id="download-btn">
            <Download className="h-4 w-4 mr-1" strokeWidth={1.8} />
            {t.downloadBtn}
          </Button>
          <Button type="button" variant="outline" onClick={copyOutput} id="copy-btn">
            <Copy className="h-4 w-4 mr-1" strokeWidth={1.8} />
            {t.copyBtn}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OutputPanel;
