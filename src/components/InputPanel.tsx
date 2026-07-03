// src/components/InputPanel.tsx v3.2.0
'use client';
import * as React from 'react';
import { X, Link, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import InputEditor from './InputEditor';
import { Translation } from '../types';

interface Stats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
}

interface InputPanelProps {
  sourceInput: string;
  urls: string[];
  isUrlSectionCollapsed: boolean;
  stats: Stats;
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

const PRESETS = ['builtin', 'adguard', 'easylist', 'neohosts'] as const;

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
  setUrls,
}) => {
  const statItems = [
    { key: 'domainCount' as const, labelKey: 'domainCount' as keyof Translation },
    { key: 'blacklistCount' as const, labelKey: 'blacklistCount' as keyof Translation },
    { key: 'whitelistCount' as const, labelKey: 'whitelistCount' as keyof Translation },
    { key: 'validCount' as const, labelKey: 'validCount' as keyof Translation },
    { key: 'commentCount' as const, labelKey: 'commentCount' as keyof Translation },
  ] as const;

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

      {/* 统计信息 */}
      <div className="stats-compact" id="stats-bar" role="region" aria-label="统计信息">
        {statItems.map(({ key, labelKey }) => (
          <Badge key={key} variant="secondary" className="stat-badge" role="status" aria-live="polite">
            <span className="stat-value" id={key} aria-label={String(t[labelKey])}>{stats[key]}</span>
            <span className="stat-label">{String(t[labelKey])}</span>
          </Badge>
        ))}
      </div>

      {/* URL 区域 */}
      <div
        className={`url-section ${isUrlSectionCollapsed ? 'collapsed' : ''}`}
        id="url-section"
        aria-hidden={isUrlSectionCollapsed}
      >
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
            <ExternalLink className="h-3.5 w-3.5 mr-1" strokeWidth={1.8} />
            {t.fetchBtn}
          </Button>
        </div>
        <div id="url-help" className="sr-only">输入URL地址获取域名列表</div>

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
              <Link className="url-item-icon h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
              <span className="url-item-text">{url}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="url-remove-btn"
                onClick={() => setUrls(urls.filter((_: string, i: number) => i !== index))}
                aria-label={`移除 ${url}`}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Button>
            </div>
          ))}
        </div>

        {/* 预设标签 */}
        <div className="preset-section">
          <span className="preset-label" id="preset-label">{t.presetLabel}</span>
          <div className="preset-tags" role="group" aria-labelledby="preset-label">
            {PRESETS.map((preset) => (
              <Badge
                key={preset}
                variant={activePreset === preset ? 'default' : 'outline'}
                className="preset-tag cursor-pointer"
                onClick={() => loadPreset(preset)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadPreset(preset); }}
                aria-pressed={activePreset === preset}
              >
                {t[preset as keyof Translation] as string}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 域名编辑器（提取为子组件） */}
      <InputEditor
        sourceInput={sourceInput}
        t={t}
        lineNumbersRef={lineNumbersRef}
        sourceTextareaRef={sourceTextareaRef}
        handleSourceInput={handleSourceInput}
        syncScroll={syncScroll}
      />

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
