'use client';
import * as React from 'react';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Settings, Translation, FormatType, OutputContent, ParsedData } from '../types';

interface OutputPanelProps {
  outputContent: OutputContent;
  currentFormat: FormatType;
  isSettingsPanelCollapsed: boolean;
  settings: Settings;
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
  setSettings: (settings: Settings) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
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
  theme = 'light',
  toggleTheme
}) => {
  return (
    <section className="panel output-section" id="output-panel" aria-labelledby="output-title">
      <div className="section-header">
        <h2 id="output-title">{t.outputTitle}</h2>
        <div className="header-actions">
          <Tabs value={currentFormat} onValueChange={(v) => setFormat(v as FormatType)} className="format-tabs" id="format-tabs">
            <TabsList>
              <TabsTrigger value="hosts" id="format-hosts-btn" role="tab" aria-selected={currentFormat === 'hosts'} aria-controls="outputPreview">Hosts</TabsTrigger>
              <TabsTrigger value="dnsmasq" id="format-dnsmasq-btn" role="tab" aria-selected={currentFormat === 'dnsmasq'} aria-controls="outputPreview">Dnsmasq</TabsTrigger>
              <TabsTrigger value="adguard" id="format-adguard-btn" role="tab" aria-selected={currentFormat === 'adguard'} aria-controls="outputPreview">{t.adguardFormat}</TabsTrigger>
              <TabsTrigger value="whitelist" id="format-whitelist-btn" role="tab" aria-selected={currentFormat === 'whitelist'} aria-controls="outputPreview">{t.whitelistFormat}</TabsTrigger>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Button>
        </div>
      </div>

      <div
        className={`settings-panel ${isSettingsPanelCollapsed ? 'collapsed' : ''}`}
        id="settings-panel"
        aria-hidden={isSettingsPanelCollapsed}
      >
        <div className="settings-grid" id="settings-grid" role="group" aria-label="设置项">
          <div className="settings-item">
            <label htmlFor="projectNameInput" id="project-name-label">{t.projectName}</label>
            <input
              type="text"
              id="projectNameInput"
              defaultValue={settings.projectName}
              onChange={updateSettings}
            />
          </div>
          <div className="settings-item">
            <label htmlFor="versionInput" id="version-label">{t.version}</label>
            <input
              type="text"
              id="versionInput"
              defaultValue={settings.version}
              onChange={updateSettings}
            />
          </div>
          <div className="settings-item">
            <label htmlFor="ipv4Input" id="ipv4-label">{t.ipV4}</label>
            <input
              type="text"
              id="ipv4Input"
              defaultValue={settings.ipv4}
              onChange={updateSettings}
            />
          </div>
          <div className="settings-item">
            <label htmlFor="ipv6Input" id="ipv6-label">{t.ipV6}</label>
            <input
              type="text"
              id="ipv6Input"
              defaultValue={settings.ipv6}
              onChange={updateSettings}
            />
          </div>
        </div>
        <div className="options-row" id="options-row" role="group" aria-label="选项">
          <label className="checkbox-item">
            <input
              type="checkbox"
              id="addHeader"
              checked={settings.addHeader}
              onChange={(e) => setSettings({...settings, addHeader: e.target.checked})}
            />
            <span id="header-comment-label">{t.headerComment}</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              id="blockIPv6"
              checked={settings.blockIPv6}
              onChange={(e) => setSettings({...settings, blockIPv6: e.target.checked})}
            />
            <span id="block-ipv6-label">{t.blockIPv6}</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              id="dedupDomains"
              checked={settings.dedupDomains}
              onChange={(e) => setSettings({...settings, dedupDomains: e.target.checked})}
            />
            <span id="dedup-label">{t.dedup}</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              id="removeWildcard"
              checked={settings.removeWildcard}
              onChange={(e) => setSettings({...settings, removeWildcard: e.target.checked})}
            />
            <span id="remove-wildcard-label">{t.removeWildcard}</span>
          </label>
          {toggleTheme && (
            <label className="checkbox-item theme-toggle-item" id="theme-setting-item">
              <input
                type="checkbox"
                id="themeToggle"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <span id="theme-mode-label">{theme === 'dark' ? t.darkMode : t.lightMode}</span>
            </label>
          )}
        </div>
      </div>

      <div className="merge-info" id="mergeInfo" role="status" aria-live="polite">
        {outputContent[currentFormat] ? (
          <span>{isLangZh ?
            `黑名单: ${parsedData.domains.length} | 白名单: ${parsedData.whitelist.length} | 自定义DNS: ${parsedData.customDns.length} | Dnsmasq: ${(outputContent.dnsmasq || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} 行 | Hosts: ${(outputContent.hosts || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} 行 | AdGuard: ${(outputContent.adguard || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} 行` :
            `Blacklist: ${parsedData.domains.length} | Whitelist: ${parsedData.whitelist.length} | Custom DNS: ${parsedData.customDns.length} | Dnsmasq: ${(outputContent.dnsmasq || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} lines | Hosts: ${(outputContent.hosts || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} lines | AdGuard: ${(outputContent.adguard || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} lines`}
          </span>
        ) : (
          t.mergeInfo
        )}
      </div>

      <div className="output-container">
        <div className="line-numbers" id="outputLineNumbers" ref={outputLineNumbersRef} aria-hidden="true"></div>
        <div
          className="output-preview"
          id="outputPreview"
          onScroll={syncOutputScroll}
          ref={outputPreviewRef}
          role="tabpanel"
          aria-label={`${currentFormat} 格式输出`}
        >
          {outputContent[currentFormat] || t.previewPlaceholder}
        </div>
      </div>

      <div className="output-actions" id="output-actions" role="group" aria-label="输出操作">
        <Button type="button" variant="default" onClick={generateRules} id="generate-rules-btn">{t.generateBtn}</Button>
        <Button type="button" variant="default" onClick={downloadOutput} id="download-btn">{t.downloadBtn}</Button>
        <Button type="button" variant="outline" onClick={copyOutput} id="copy-btn">{t.copyBtn}</Button>
      </div>
    </section>
  );
};

export default OutputPanel;
