// src/components/UrlSection.tsx v3.5.0
// URL 导入区域组件 —— 从 InputPanel 拆分
'use client';
import * as React from 'react';
import { X, Link, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Translation } from '../types';
import { useT } from '../context/AppContext';
import { config } from '../config';

interface UrlSectionProps {
  isCollapsed: boolean;
  urls: string[];
  urlInputRef: React.RefObject<HTMLInputElement>;
  fetchFromUrl: () => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  setUrls: (urls: string[]) => void;
}

const PRESETS = ['builtin', 'adguard', 'easylist', 'neohosts'] as const;

// 预设标识符到翻译键的映射（config 用 'builtin'，Translation 接口用 'builtinAd'）
const PRESET_LABEL_KEY: Record<typeof PRESETS[number], keyof Translation> = {
  builtin: 'builtinAd',
  adguard: 'adguard',
  easylist: 'easylist',
  neohosts: 'neohosts',
};

interface PresetTagsProps {
  activePreset: string;
  loadPreset: (preset: string) => void;
}

export const PresetTags: React.FC<PresetTagsProps> = ({
  activePreset,
  loadPreset,
}) => {
  const t = useT();
  return (
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
            {t[PRESET_LABEL_KEY[preset]] as string}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const UrlSection: React.FC<UrlSectionProps> = ({
  isCollapsed,
  urls,
  urlInputRef,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  setUrls,
}) => {
  const t = useT();
  return (
    <div
      className={`url-section ${isCollapsed ? 'collapsed' : ''}`}
      id="url-section"
      aria-hidden={isCollapsed}
    >
      <div className="url-input-row">
        <label htmlFor="urlInput" className="sr-only">{t.urlPlaceholder}</label>
        <Input
          type="text"
          id="urlInput"
          ref={urlInputRef as React.RefObject<HTMLInputElement>}
          placeholder={t.urlPlaceholder}
          defaultValue={config.domainsUrl}
          aria-describedby="url-help"
          className="url-input"
        />
        <Button type="button" variant="default" size="sm" onClick={fetchFromUrl} id="fetch-url-btn" aria-describedby="url-help">
          <ExternalLink className="h-3.5 w-3.5 mr-1" strokeWidth={1.8} aria-hidden="true" />
          {t.fetchBtn}
        </Button>
      </div>
      <div id="url-help" className="sr-only">{t.urlHelp}</div>

      {/* URL 操作按钮 */}
      <div className="url-actions" role="group" aria-label={t.urlActionsAria}>
        <Button type="button" variant="outline" size="sm" onClick={addUrl} id="add-url-btn">{t.addUrl}</Button>
        <Button type="button" variant="outline" size="sm" onClick={sortUrls} id="sort-urls-btn">{t.sortUrlBtn}</Button>
        <Button type="button" variant="outline" size="sm" onClick={fetchAllUrls} id="fetch-all-urls-btn">{t.fetchAllUrls}</Button>
      </div>

      {/* URL 列表 */}
      <div className="url-list" id="urlList" role="list" aria-label={t.urlListAria}>
        {urls.map((url: string, index: number) => (
          <div key={index} className="url-item" role="listitem">
            <Link className="url-item-icon h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} aria-hidden="true" />
            <span className="url-item-text">{url}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="url-remove-btn"
              onClick={() => setUrls(urls.filter((_: string, i: number) => i !== index))}
              aria-label={t.removeUrlAria.replace('{url}', url)}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrlSection;
