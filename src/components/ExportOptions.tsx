// src/components/ExportOptions.tsx v2.2.1
import React, { useRef } from 'react';
import { OutputContent, ParsedData, Settings, FormatType, Translation } from '@/types';

interface ExportOptionsProps {
  outputContent: OutputContent;
  currentFormat: FormatType;
  isSettingsPanelCollapsed: boolean;
  settings: Settings;
  parsedData: ParsedData;
  t: Translation;
  isLangZh: boolean;
  toggleSection: (section: string) => void;
  setFormat: (format: FormatType) => void;
  updateSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateRules: () => void;
  downloadOutput: () => void;
  copyOutput: () => void;
  syncOutputScroll: () => void;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  outputContent,
  currentFormat,
  isSettingsPanelCollapsed,
  settings,
  parsedData,
  t,
  isLangZh,
  toggleSection,
  setFormat,
  updateSettings,
  generateRules,
  downloadOutput,
  copyOutput,
  syncOutputScroll,
  setSettings
}) => {
  const outputPreviewRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);

  return (
    <div className="panel output-section" id="output-panel">
      <div className="section-header">
        <h2>{t.outputTitle}</h2>
        <div className="header-actions">
          <div className="format-tabs">
            <button 
              className={`format-tab ${currentFormat === 'hosts' ? 'active' : ''}`} 
              onClick={() => setFormat('hosts')}
            >
              Hosts
            </button>
            <button 
              className={`format-tab ${currentFormat === 'dnsmasq' ? 'active' : ''}`} 
              onClick={() => setFormat('dnsmasq')}
            >
              Dnsmasq
            </button>
            <button 
              className={`format-tab ${currentFormat === 'adguard' ? 'active' : ''}`} 
              onClick={() => setFormat('adguard')}
            >
              {t.adguardFormat}
            </button>
            <button 
              className={`format-tab ${currentFormat === 'whitelist' ? 'active' : ''}`} 
              onClick={() => setFormat('whitelist')}
            >
              {t.whitelistFormat}
            </button>
          </div>
          <button className="settings-btn" onClick={() => toggleSection('settings-panel')} title={t.settingsTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className={`settings-panel ${isSettingsPanelCollapsed ? 'collapsed' : ''}`} id="settings-panel">
        <div className="settings-grid">
          <div className="settings-item">
            <label>{t.projectName}</label>
            <input 
              type="text" 
              id="projectNameInput" 
              defaultValue={settings.projectName}
              onChange={updateSettings}
            />
          </div>
          <div className="settings-item">
            <label>{t.version}</label>
            <input 
              type="text" 
              id="versionInput" 
              defaultValue={settings.version}
              onChange={updateSettings}
            />
          </div>
          <div className="settings-item">
            <label>{t.ipV4}</label>
            <input 
              type="text" 
              id="ipv4Input" 
              defaultValue={settings.ipv4}
              onChange={updateSettings}
            />
          </div>
          <div className="settings-item">
            <label>{t.ipV6}</label>
            <input 
              type="text" 
              id="ipv6Input" 
              defaultValue={settings.ipv6}
              onChange={updateSettings}
            />
          </div>
        </div>
        <div className="options-row">
          <label className="checkbox-item">
            <input 
              type="checkbox" 
              id="addHeader" 
              checked={settings.addHeader}
              onChange={(e) => setSettings({...settings, addHeader: e.target.checked})}
            />
            <span>{t.headerComment}</span>
          </label>
          <label className="checkbox-item">
            <input 
              type="checkbox" 
              id="blockIPv6" 
              checked={settings.blockIPv6}
              onChange={(e) => setSettings({...settings, blockIPv6: e.target.checked})}
            />
            <span>{t.blockIPv6}</span>
          </label>
          <label className="checkbox-item">
            <input 
              type="checkbox" 
              id="dedupDomains" 
              checked={settings.dedupDomains}
              onChange={(e) => setSettings({...settings, dedupDomains: e.target.checked})}
            />
            <span>{t.dedup}</span>
          </label>
          <label className="checkbox-item">
            <input 
              type="checkbox" 
              id="removeWildcard" 
              checked={settings.removeWildcard}
              onChange={(e) => setSettings({...settings, removeWildcard: e.target.checked})}
            />
            <span>{t.removeWildcard}</span>
          </label>
        </div>
      </div>

      <div className="merge-info" id="mergeInfo">
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
        <div className="line-numbers" id="outputLineNumbers" ref={outputLineNumbersRef}></div>
        <div 
          className="output-preview" 
          id="outputPreview" 
          onScroll={syncOutputScroll}
          ref={outputPreviewRef}
        >
          {outputContent[currentFormat] || t.previewPlaceholder}
        </div>
      </div>

      <div className="output-actions">
        <button className="btn btn-success" onClick={generateRules}>{t.generateBtn}</button>
        <button className="btn btn-primary" onClick={downloadOutput}>{t.downloadBtn}</button>
        <button className="btn btn-outline" onClick={copyOutput}>{t.copyBtn}</button>
      </div>
    </div>
  );
};

export default ExportOptions;
