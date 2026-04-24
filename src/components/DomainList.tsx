// src/components/DomainList.tsx v2.2.5
import React, { useRef } from 'react';
import { Stats } from '../types';

interface DomainListProps {
  sourceInput: string;
  stats: Stats;
  t: any;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  syncScroll: () => void;
  clearAll: () => void;
  sortDomains: () => void;
  parseSource: () => void;
  dedupeDomains: () => void;
  saveDomains: () => void;
}

const DomainList: React.FC<DomainListProps> = ({
  sourceInput,
  stats,
  t,
  handleSourceInput,
  syncScroll,
  clearAll,
  sortDomains,
  parseSource,
  dedupeDomains,
  saveDomains
}) => {
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  return (
    <>
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
        <button className="btn btn-primary" onClick={() => parseSource()}>{t.parseBtn}</button>
        <button className="btn btn-outline" onClick={dedupeDomains}>{t.dedupeBtn}</button>
        <button className="btn btn-outline" onClick={saveDomains}>{t.saveBtn}</button>
      </div>
    </>
  );
};

export default DomainList;
