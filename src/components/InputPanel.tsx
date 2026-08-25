// src/components/InputPanel.tsx v3.9.5
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
  loadPreset,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  setUrls,
  isLoading,
}) => {
  const t = useT();
  // 统计项与彩色圆点语义映射，对齐原型 .input-panel 的 .stat-dot（block/allow/dns）
  const statItems = [
    { key: 'blacklistCount' as const, labelKey: 'blacklistCount' as keyof Translation, dot: 'block' as const },
    { key: 'whitelistCount' as const, labelKey: 'whitelistCount' as keyof Translation, dot: 'allow' as const },
    { key: 'customDnsCount' as const, labelKey: 'customDnsCount' as keyof Translation, dot: 'dns' as const },
    { key: 'commentCount' as const, labelKey: 'commentCount' as keyof Translation, dot: null },
    { key: 'invalidCount' as const, labelKey: 'invalidCount' as keyof Translation, dot: null },
    { key: 'totalLines' as const, labelKey: 'totalLines' as keyof Translation, dot: null },
  ] as const;

  return (
    <section className="panel input-section" id="input-panel" aria-labelledby="input-title">
      {/* 卡片头：标题 + 图标（对齐原型 .card-head / .card-title） */}
      <div className="panel-header" id="input-section-header">
        <div className="panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          <h2 id="input-title">{t.inputTitle}</h2>
        </div>
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

      {/* 预设标签：对齐原型置于卡片头下方、始终显示（不依赖 URL 区折叠） */}
      <PresetTags
        activePreset={activePreset}
        loadPreset={loadPreset}
      />

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

      {/* 统计信息：带彩色圆点胶囊（对齐原型 .stat / .stat-dot） */}
      <div className="stats-compact" id="stats-bar" role="region" aria-label={t.statsAria}>
        {statItems.map(({ key, labelKey, dot }) => (
          <Badge key={key} variant="secondary" className="stat-badge" role="status" aria-live="polite">
            {dot && <span className={`stat-dot ${dot}`} aria-hidden="true" />}
            <span className="stat-value" id={key} aria-label={String(t[labelKey])}>{stats[key]}</span>
            <span className="stat-label">{String(t[labelKey])}</span>
          </Badge>
        ))}
      </div>

      {/* 域名编辑器（提取为子组件） */}
      <InputEditor
        sourceInput={sourceInput}
        lineNumbersRef={lineNumbersRef}
        sourceTextareaRef={sourceTextareaRef}
        handleSourceInput={handleSourceInput}
        syncScroll={syncScroll}
      />

      {/* 编辑操作按钮（对齐原型 inputEditorActions：生成规则 / 排序 / 去重 / 清空） */}
      <div className="editor-actions" id="input-editor-actions" role="group" aria-label={t.editorActionsAria}>
        <Button type="button" variant="default" onClick={generateRules} id="parse-btn">{t.generateBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={sortDomains} id="sort-btn">{t.sortBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={dedupeDomains} id="dedupe-btn">{t.dedupeBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={clearAll} id="clear-btn">{t.clearBtn}</Button>
      </div>
    </section>
  );
};

export default InputPanel;




