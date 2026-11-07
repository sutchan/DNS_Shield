// src/components/InputPanel.tsx v3.13.6
'use client';
import * as React from 'react';
import { Button } from './ui/Button';
import InputEditor from './InputEditor';
import UrlSection, { PresetTags } from './UrlSection';
import { CategoryFilter } from './CategoryFilter';
import { useT } from '../context/AppContext';
import { InputPanelProps, STAT_ITEMS } from './InputPanel.types';

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
  generateRules,
  dedupeDomains,
  loadPreset,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  setUrls,
  isLoading,
  progress,
  isProcessing,
  categoryAvailable,
  categoryIndex,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
}) => {
  const t = useT();
  // Worker 处理进度百分比与耗时文案（仅大文本任务会上报进度）
  const percent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.processed / progress.total) * 100))
      : 0;
  const elapsedLabel = progress?.elapsed != null ? ` · ${progress.elapsed}ms` : '';

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

      {/* 域名分类筛选：仅在分类索引可用时渲染（数值来自真实上游命中索引） */}
      {categoryAvailable && (
        <CategoryFilter
          index={categoryIndex}
          selected={selectedCategories}
          onToggle={onToggleCategory}
          onClear={onClearCategories}
          clearLabel={t.clearBtn}
        />
      )}

      {/* 统计信息：彩色圆点 + 纯文本（v3.17.0 由胶囊 Badge 简化，对齐原型 .stat-dot） */}
      <div className="stats-compact" id="stats-bar" role="region" aria-label={t.statsAria}>
        {STAT_ITEMS.map(({ key, labelKey, dot }) => (
          <span key={key} className="stat-badge" role="status" aria-live="polite">
            {dot && <span className={`stat-dot ${dot}`} aria-hidden="true" />}
            <span className="stat-value" id={key} aria-label={String(t[labelKey])}>{stats[key]}</span>
            <span className="stat-label">{String(t[labelKey])}</span>
          </span>
        ))}
      </div>

      {/* Worker 处理进度：仅在处理大文本时出现 */}
      {isProcessing && (
        <div className="process-progress" id="process-progress" role="status" aria-live="polite">
          <div
            className="process-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="process-progress-bar" style={{ width: `${percent}%` }} />
          </div>
          <span className="process-progress-text">
            {String(t.toast.loading)} {percent}%{elapsedLabel}
          </span>
        </div>
      )}

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




