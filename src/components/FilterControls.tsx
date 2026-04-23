// src/components/FilterControls.tsx v2.2.1
import React, { useRef } from 'react';

interface FilterControlsProps {
  isUrlSectionCollapsed: boolean;
  urls: string[];
  isLoading: boolean;
  activePreset: string;
  t: any;
  toggleSection: (section: string) => void;
  fetchFromUrl: () => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  loadPreset: (preset: string) => void;
  setUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  isUrlSectionCollapsed,
  urls,
  isLoading,
  activePreset,
  t,
  toggleSection,
  fetchFromUrl,
  addUrl,
  sortUrls,
  fetchAllUrls,
  loadPreset,
  setUrls
}) => {
  const urlInputRef = useRef<HTMLInputElement>(null);

  return (
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
              onClick={() => setUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index))}
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
  );
};

export default FilterControls;
