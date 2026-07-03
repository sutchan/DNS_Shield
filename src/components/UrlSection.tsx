// src/components/UrlSection.tsx v3.4.0
// URL 导入区域组件 —— 从 InputPanel 拆分
'use client';
import * as React from 'react';
import { X, Link, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Translation } from '../types';

interface UrlSectionProps {
  isCollapsed: boolean;
  urls: string[];
  t: Translation;
  urlInputRef: React.RefObject<HTMLInputElement>;
  fetchFromUrl: () => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  setUrls: (urls: string[]) => void;
}

const PRESETS = ['builtin', 'adguard', 'easylist', 'neohosts'] as const;

interface PresetTagsProps {
  activePreset: string;
  t: Translation;
  loadPreset: (preset: string) => void;
}

export const PresetTags: React.FC<PresetTagsProps> = ({
  activePreset,
  t,
  loadPreset,
}) => {
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
            {t[preset as keyof Translation] as string}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const UrlSection: React.FC<UrlSectionProps> = ({
  isCollapsed,
  urls,
  t,
  urlInputRef,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  setUrls,
}) => {
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
    </div>
  );
};

export default UrlSection;
