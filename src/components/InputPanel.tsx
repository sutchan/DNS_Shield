// src/components/InputPanel.tsx v2.2.5
import React from 'react';
import { Translation } from '../types';

interface InputPanelProps {
  sourceInput: string;
  urls: string[];
  isUrlSectionCollapsed: boolean;
  stats: {
    domainCount: number;
    validCount: number;
    commentCount: number;
    blacklistCount: number;
    whitelistCount: number;
  };
  activePreset: string;
  t: Translation;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  urlInputRef: React.RefObject<HTMLInputElement>;
  toggleSection: (section: string) => void;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  syncScroll: () => void;
  clearAll: () => void;
  sortDomains: () => void;
  parseSource: () => void;
  dedupeDomains: () => void;
  saveDomains: () => void;
  loadPreset: (preset: string) => void;
  fetchFromUrl: () => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  setUrls: (urls: string[]) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  sourceInput,
  urls,
  isUrlSectionCollapsed,
  stats,
  activePreset,
  t,
  lineNumbersRef,
  sourceTextareaRef,
  urlInputRef,
  toggleSection,
  handleSourceInput,
  syncScroll,
  clearAll,
  sortDomains,
  parseSource,
  dedupeDomains,
  saveDomains,
  loadPreset,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  setUrls
}) => {
  return (
    <section className="panel input-section" id="input-panel">
      <div className="section-header">
        <h2>{t.inputTitle}</h2>
        <button className="collapse-btn" onClick={() => toggleSection('url-section')}>
          <span className="collapse-icon">▼</span>
          <span>{t.advanced}</span>
        </button>
      </div>

      <div className="stats-compact" id="stats-bar">
        <div className="stat-badge">
          <span className="stat-value" id="domainCount">{stats.domainCount}</span>
          <span className="stat-label">{t.domainCount}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value" id="blacklistCount">{stats.blacklistCount}</span>
          <span className="stat-label">{t.blacklistCount}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value" id="whitelistCount">{stats.whitelistCount}</span>
          <span className="stat-label">{t.whitelistCount}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value" id="validCount">{stats.validCount}</span>
          <span className="stat-label">{t.validCount}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value" id="commentCount">{stats.commentCount}</span>
          <span className="stat-label">{t.commentCount}</span>
        </div>
      </div>

      <div className={`url-section ${isUrlSectionCollapsed ? 'collapsed' : ''}`} id="url-section">
        <div className="url-input-row">
          <input 
            type="text" 
            className="url-input" 
            id="urlInput" 
            ref={urlInputRef}
            placeholder={t.urlPlaceholder} 
            defaultValue="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
          />
          <button className="btn btn-primary" onClick={fetchFromUrl}>{t.fetchBtn}</button>
        </div>
        <div className="url-actions">
          <button className="btn btn-sm" onClick={addUrl}>{t.addUrl}</button>
          <button className="btn btn-sm" onClick={sortUrls}>{t.sortUrlBtn}</button>
          <button className="btn btn-sm" onClick={fetchAllUrls}>{t.fetchAllUrls}</button>
        </div>
        <div className="url-list" id="urlList">
          {urls.map((url: string, index: number) => (
            <div key={index} className="url-item">
              <span>{url}</span>
              <button 
                className="url-remove-btn"
                onClick={() => setUrls(urls.filter((_: string, i: number) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="preset-section">
          <span className="preset-label">{t.presetLabel}</span>
          <div className="preset-tags">
            <span className={`preset-tag ${activePreset === 'builtin' ? 'active' : ''}`} onClick={() => loadPreset('builtin')}>{t.builtinAd}</span>
            <span className={`preset-tag ${activePreset === 'adguard' ? 'active' : ''}`} onClick={() => loadPreset('adguard')}>{t.adguard}</span>
            <span className={`preset-tag ${activePreset === 'easylist' ? 'active' : ''}`} onClick={() => loadPreset('easylist')}>{t.easylist}</span>
            <span className={`preset-tag ${activePreset === 'neohosts' ? 'active' : ''}`} onClick={() => loadPreset('neohosts')}>{t.neohosts}</span>
          </div>
        </div>
      </div>

      <div className="editor-container">
        <div className="line-numbers" id="lineNumbers" ref={lineNumbersRef}></div>
        <textarea 
          id="sourceInput" 
          placeholder={t.inputPlaceholder} 
          value={sourceInput}
          onChange={handleSourceInput}
          onScroll={syncScroll}
          ref={sourceTextareaRef}
        ></textarea>
      </div>

      <div className="editor-actions">
        <button className="btn btn-outline" onClick={clearAll}>{t.clearBtn}</button>
        <button className="btn btn-outline" onClick={sortDomains}>{t.sortBtn}</button>
        <button className="btn btn-primary" onClick={parseSource}>{t.parseBtn}</button>
        <button className="btn btn-outline" onClick={dedupeDomains}>{t.dedupeBtn}</button>
        <button className="btn btn-outline" onClick={saveDomains}>{t.saveBtn}</button>
      </div>
    </section>
  );
};

export default InputPanel;