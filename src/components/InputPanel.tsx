// src/components/InputPanel.tsx v3.8.6
'use client';
import * as React from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import InputEditor from './InputEditor';
import UrlSection, { PresetTags } from './UrlSection';
import { Translation, Stats } from '../types';
import { useT } from '../context/AppContext';

interface InputPanelProps {
  sourceInput: string;
  urls: string[];
  isUrlSectionCollapsed: boolean;
  stats: Stats;
  activePreset: string;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  urlInput: string;
  setUrlInput: (value: string) => void;
  toggleSection: (section: string) => void;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  syncScroll: () => void;
  clearAll: () => void;
  sortDomains: () => void;
  parseSource: () => void;
  generateRules: () => void;
  dedupeDomains: () => void;
  saveDomains: () => void;
  loadPreset: (preset: string) => void;
  fetchFromUrl: () => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  setUrls: (urls: string[]) => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({
  sourceInput,
  urls,
  isUrlSectionCollapsed,
  stats,
  activePreset,
  lineNumbersRef,
  sourceTextareaRef,
  urlInput,
  setUrlInput,
  toggleSection,
  handleSourceInput,
  syncScroll,
  clearAll,
  sortDomains,
  parseSource,
  generateRules,
  dedupeDomains,
  saveDomains,
  loadPreset,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  setUrls,
  isLoading,
}) => {
  const t = useT();
  const statItems = [
    { key: 'domainCount' as const, labelKey: 'domainCount' as keyof Translation },
    { key: 'blacklistCount' as const, labelKey: 'blacklistCount' as keyof Translation },
    { key: 'whitelistCount' as const, labelKey: 'whitelistCount' as keyof Translation },
    { key: 'customDnsCount' as const, labelKey: 'customDnsCount' as keyof Translation },
    { key: 'commentCount' as const, labelKey: 'commentCount' as keyof Translation },
    { key: 'totalLines' as const, labelKey: 'totalLines' as keyof Translation },
  ] as const;

  return (
    <section className="panel input-section" id="input-panel" aria-labelledby="input-title">
      {/* 标题栏 */}
      <div className="section-header" id="input-section-header">
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
      <div className="stats-compact" id="stats-bar" role="region" aria-label={t.statsAria}>
        {statItems.map(({ key, labelKey }) => (
          <Badge key={key} variant="secondary" className="stat-badge" role="status" aria-live="polite">
            <span className="stat-value" id={key} aria-label={String(t[labelKey])}>{stats[key]}</span>
            <span className="stat-label">{String(t[labelKey])}</span>
          </Badge>
        ))}
      </div>

      {/* URL 区域 */}
      <UrlSection
        isCollapsed={isUrlSectionCollapsed}
        urls={urls}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        fetchFromUrl={fetchFromUrl}
        addUrl={addUrl}
        sortUrls={sortUrls}
        fetchAllUrls={fetchAllUrls}
        setUrls={setUrls}
        isLoading={isLoading}
      />

      {/* 预设标签 */}
      {!isUrlSectionCollapsed && (
        <PresetTags
          activePreset={activePreset}
          loadPreset={loadPreset}
        />
      )}

      {/* 域名编辑器（提取为子组件） */}
      <InputEditor
        sourceInput={sourceInput}
        lineNumbersRef={lineNumbersRef}
        sourceTextareaRef={sourceTextareaRef}
        handleSourceInput={handleSourceInput}
        syncScroll={syncScroll}
      />

      {/* 编辑操作按钮 */}
      <div className="editor-actions" id="input-editor-actions" role="group" aria-label={t.editorActionsAria}>
        <Button type="button" variant="outline" size="sm" onClick={clearAll} id="clear-btn">{t.clearBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={sortDomains} id="sort-btn">{t.sortBtn}</Button>
        <Button type="button" variant="default" onClick={generateRules} id="parse-btn">{t.generateBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={dedupeDomains} id="dedupe-btn">{t.dedupeBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={saveDomains} id="save-btn">{t.saveBtn}</Button>
      </div>
    </section>
  );
};

export default InputPanel;




