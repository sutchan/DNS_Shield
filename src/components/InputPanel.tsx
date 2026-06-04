// src/components/InputPanel.tsx v2.2.8
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
    <section className="panel input-section" id="input-panel" aria-labelledby="input-title">
      <div className="section-header">
        <h2 id="input-title">{t.inputTitle}</h2>
        <button 
          className="collapse-btn" 
          onClick={() => toggleSection('url-section')} 
          id="toggle-url-section-btn"
          aria-expanded={!isUrlSectionCollapsed}
          aria-controls="url-section"
        >
          <span className={`collapse-icon ${isUrlSectionCollapsed ? 'collapsed' : ''}`} aria-hidden="true">▼</span>
          <span>{t.advanced}</span>
        </button>
      </div>

      <div className="stats-compact" id="stats-bar" role="region" aria-label="统计信息">
        <div className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="domainCount" aria-label={t.domainCount}>{stats.domainCount}</span>
          <span className="stat-label">{t.domainCount}</span>
        </div>
        <div className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="blacklistCount" aria-label={t.blacklistCount}>{stats.blacklistCount}</span>
          <span className="stat-label">{t.blacklistCount}</span>
        </div>
        <div className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="whitelistCount" aria-label={t.whitelistCount}>{stats.whitelistCount}</span>
          <span className="stat-label">{t.whitelistCount}</span>
        </div>
        <div className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="validCount" aria-label={t.validCount}>{stats.validCount}</span>
          <span className="stat-label">{t.validCount}</span>
        </div>
        <div className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="commentCount" aria-label={t.commentCount}>{stats.commentCount}</span>
          <span className="stat-label">{t.commentCount}</span>
        </div>
      </div>

      <div 
        className={`url-section ${isUrlSectionCollapsed ? 'collapsed' : ''}`} 
        id="url-section"
        aria-hidden={isUrlSectionCollapsed}
      >
        <div className="url-input-row">
          <label htmlFor="urlInput" className="sr-only">{t.urlPlaceholder}</label>
          <input 
            type="text" 
            className="url-input" 
            id="urlInput" 
            ref={urlInputRef}
            placeholder={t.urlPlaceholder} 
            defaultValue="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
            aria-describedby="url-help"
          />
          <button 
            className="btn btn-primary" 
            onClick={fetchFromUrl} 
            id="fetch-url-btn"
            aria-describedby="url-help"
          >
            {t.fetchBtn}
          </button>
        </div>
        <div id="url-help" className="sr-only">
          输入URL地址获取域名列表
        </div>
        <div className="url-actions" role="group" aria-label="URL操作">
          <button className="btn btn-sm" onClick={addUrl} id="add-url-btn">{t.addUrl}</button>
          <button className="btn btn-sm" onClick={sortUrls} id="sort-urls-btn">{t.sortUrlBtn}</button>
          <button className="btn btn-sm" onClick={fetchAllUrls} id="fetch-all-urls-btn">{t.fetchAllUrls}</button>
        </div>
        <div className="url-list" id="urlList" role="list" aria-label="URL列表">
          {urls.map((url: string, index: number) => (
            <div key={index} className="url-item" role="listitem">
              <span>{url}</span>
              <button 
                className="url-remove-btn"
                onClick={() => setUrls(urls.filter((_: string, i: number) => i !== index))}
                aria-label={`移除 ${url}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="preset-section">
          <span className="preset-label" id="preset-label">{t.presetLabel}</span>
          <div className="preset-tags" role="group" aria-labelledby="preset-label">
            <span 
              className={`preset-tag ${activePreset === 'builtin' ? 'active' : ''}`} 
              onClick={() => loadPreset('builtin')}
              role="button"
              tabIndex={0}
              aria-pressed={activePreset === 'builtin'}
            >
              {t.builtinAd}
            </span>
            <span 
              className={`preset-tag ${activePreset === 'adguard' ? 'active' : ''}`} 
              onClick={() => loadPreset('adguard')}
              role="button"
              tabIndex={0}
              aria-pressed={activePreset === 'adguard'}
            >
              {t.adguard}
            </span>
            <span 
              className={`preset-tag ${activePreset === 'easylist' ? 'active' : ''}`} 
              onClick={() => loadPreset('easylist')}
              role="button"
              tabIndex={0}
              aria-pressed={activePreset === 'easylist'}
            >
              {t.easylist}
            </span>
            <span 
              className={`preset-tag ${activePreset === 'neohosts' ? 'active' : ''}`} 
              onClick={() => loadPreset('neohosts')}
              role="button"
              tabIndex={0}
              aria-pressed={activePreset === 'neohosts'}
            >
              {t.neohosts}
            </span>
          </div>
        </div>
      </div>

      <div className="editor-container">
        <div className="line-numbers" id="lineNumbers" ref={lineNumbersRef} aria-hidden="true"></div>
        <label htmlFor="sourceInput" className="sr-only">{t.inputPlaceholder}</label>
        <textarea 
          id="sourceInput" 
          placeholder={t.inputPlaceholder} 
          value={sourceInput}
          onChange={handleSourceInput}
          onScroll={syncScroll}
          ref={sourceTextareaRef}
          aria-describedby="sourceInput-help"
        ></textarea>
      </div>
      <div id="sourceInput-help" className="sr-only">
        输入域名列表，每行一个
      </div>

      <div className="editor-actions" role="group" aria-label="编辑操作">
        <button className="btn btn-outline" onClick={clearAll} id="clear-btn">{t.clearBtn}</button>
        <button className="btn btn-outline" onClick={sortDomains} id="sort-btn">{t.sortBtn}</button>
        <button className="btn btn-primary" onClick={parseSource} id="parse-btn">{t.parseBtn}</button>
        <button className="btn btn-outline" onClick={dedupeDomains} id="dedupe-btn">{t.dedupeBtn}</button>
        <button className="btn btn-outline" onClick={saveDomains} id="save-btn">{t.saveBtn}</button>
      </div>
    </section>
  );
};

export default InputPanel;
