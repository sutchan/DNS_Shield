// src/components/InputPanel.tsx v2.3.0
'use client';
import * as React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
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
      {/* 标题栏 */}
      <div className="section-header">
        <h2 id="input-title">{t.inputTitle}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="collapse-btn"
          onClick={() => toggleSection('url-section')}
          id="toggle-url-section-btn"
          aria-expanded={!isUrlSectionCollapsed}
          aria-controls="url-section"
        >
          <span className={`collapse-icon ${isUrlSectionCollapsed ? 'collapsed' : ''}`} aria-hidden="true">▼</span>
          <span>{t.advanced}</span>
        </Button>
      </div>

      {/* 统计信息 — shadcn Badge */}
      <div className="stats-compact" id="stats-bar" role="region" aria-label="统计信息">
        <Badge variant="secondary" className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="domainCount" aria-label={t.domainCount}>{stats.domainCount}</span>
          <span className="stat-label">{t.domainCount}</span>
        </Badge>
        <Badge variant="secondary" className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="blacklistCount" aria-label={t.blacklistCount}>{stats.blacklistCount}</span>
          <span className="stat-label">{t.blacklistCount}</span>
        </Badge>
        <Badge variant="secondary" className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="whitelistCount" aria-label={t.whitelistCount}>{stats.whitelistCount}</span>
          <span className="stat-label">{t.whitelistCount}</span>
        </Badge>
        <Badge variant="secondary" className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="validCount" aria-label={t.validCount}>{stats.validCount}</span>
          <span className="stat-label">{t.validCount}</span>
        </Badge>
        <Badge variant="secondary" className="stat-badge" role="status" aria-live="polite">
          <span className="stat-value" id="commentCount" aria-label={t.commentCount}>{stats.commentCount}</span>
          <span className="stat-label">{t.commentCount}</span>
        </Badge>
      </div>

      {/* URL 区域（可折叠） */}
      <div
        className={`url-section ${isUrlSectionCollapsed ? 'collapsed' : ''}`}
        id="url-section"
        aria-hidden={isUrlSectionCollapsed}
      >
        {/* URL 输入行 — shadcn Input */}
        <div className="url-input-row">
          <label htmlFor="urlInput" className="sr-only">{t.urlPlaceholder}</label>
          <Input
            type="text"
            id="urlInput"
            ref={urlInputRef as React.RefObject<HTMLInputElement>}
            placeholder={t.urlPlaceholder}
            defaultValue="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
            aria-describedby="url-help"
            className="url-input"
          />
          <Button type="button" variant="default" size="sm" onClick={fetchFromUrl} id="fetch-url-btn" aria-describedby="url-help">
            {t.fetchBtn}
          </Button>
        </div>
        <div id="url-help" className="sr-only">
          输入URL地址获取域名列表
        </div>

        {/* URL 操作按钮 */}
        <div className="url-actions" role="group" aria-label="URL操作">
          <Button type="button" variant="outline" size="sm" onClick={addUrl} id="add-url-btn">{t.addUrl}</Button>
          <Button type="button" variant="outline" size="sm" onClick={sortUrls} id="sort-urls-btn">{t.sortUrlBtn}</Button>
          <Button type="button" variant="outline" size="sm" onClick={fetchAllUrls} id="fetch-all-urls-btn">{t.fetchAllUrls}</Button>
        </div>

        {/* URL 列表 */}
        <div className="url-list" id="urlList" role="list" aria-label="URL列表">
          {urls.map((url: string, index: number) => (
            <div key={index} className="url-item" role="listitem">
              <span>{url}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="url-remove-btn"
                onClick={() => setUrls(urls.filter((_: string, i: number) => i !== index))}
                aria-label={`移除 ${url}`}
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        {/* 预设标签 — shadcn Badge variant */}
        <div className="preset-section">
          <span className="preset-label" id="preset-label">{t.presetLabel}</span>
          <div className="preset-tags" role="group" aria-labelledby="preset-label">
            <Badge
              variant={activePreset === 'builtin' ? 'default' : 'outline'}
              className="preset-tag cursor-pointer"
              onClick={() => loadPreset('builtin')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadPreset('builtin'); }}
              aria-pressed={activePreset === 'builtin'}
            >
              {t.builtinAd}
            </Badge>
            <Badge
              variant={activePreset === 'adguard' ? 'default' : 'outline'}
              className="preset-tag cursor-pointer"
              onClick={() => loadPreset('adguard')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadPreset('adguard'); }}
              aria-pressed={activePreset === 'adguard'}
            >
              {t.adguard}
            </Badge>
            <Badge
              variant={activePreset === 'easylist' ? 'default' : 'outline'}
              className="preset-tag cursor-pointer"
              onClick={() => loadPreset('easylist')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadPreset('easylist'); }}
              aria-pressed={activePreset === 'easylist'}
            >
              {t.easylist}
            </Badge>
            <Badge
              variant={activePreset === 'neohosts' ? 'default' : 'outline'}
              className="preset-tag cursor-pointer"
              onClick={() => loadPreset('neohosts')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadPreset('neohosts'); }}
              aria-pressed={activePreset === 'neohosts'}
            >
              {t.neohosts}
            </Badge>
          </div>
        </div>
      </div>

      {/* 域名编辑器 */}
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
          className="w-full min-h-[200px] py-3 pl-14 pr-3 text-sm font-mono bg-background resize-y focus:outline-none"
        />
      </div>
      <div id="sourceInput-help" className="sr-only">
        输入域名列表，每行一个
      </div>

      {/* 编辑操作按钮 */}
      <div className="editor-actions" role="group" aria-label="编辑操作">
        <Button type="button" variant="outline" size="sm" onClick={clearAll} id="clear-btn">{t.clearBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={sortDomains} id="sort-btn">{t.sortBtn}</Button>
        <Button type="button" variant="default" onClick={parseSource} id="parse-btn">{t.parseBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={dedupeDomains} id="dedupe-btn">{t.dedupeBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={saveDomains} id="save-btn">{t.saveBtn}</Button>
      </div>
    </section>
  );
};

export default InputPanel;
