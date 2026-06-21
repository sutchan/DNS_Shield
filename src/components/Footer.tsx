// src/components/Footer.tsx v2.3.1
import React, { useState } from 'react';
import { Translation } from '../types';

interface FooterProps {
  t: Translation;
  version: string;
}

const Footer: React.FC<FooterProps> = ({
  t,
  version
}) => {
  const [isUsageGuideCollapsed, setIsUsageGuideCollapsed] = useState(true);

  const toggleUsageGuide = () => {
    setIsUsageGuideCollapsed(!isUsageGuideCollapsed);
  };

  return (
    <footer className="app-footer" id="about-panel" role="contentinfo">
      <div className="footer-content">
        <div className="footer-top">
          <a 
            href="https://github.com/sutchan/DNS_Shield" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link" 
            id="github-link"
            aria-label="访问 GitHub 仓库（新窗口打开）"
          >
            GitHub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <a 
            href="https://dns.ewuse.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link" 
            id="demo-link"
            aria-label="访问演示站点（新窗口打开）"
          >
            Demo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <button 
            className="usage-toggle" 
            id="usageToggle" 
            onClick={toggleUsageGuide}
            aria-expanded={!isUsageGuideCollapsed}
            aria-controls="usageGuide"
          >
            <span id="usageToggleText">{t.usageToggle}</span>
            <svg className={`toggle-arrow ${isUsageGuideCollapsed ? 'collapsed' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <span className="footer-version" id="version-display" aria-label={`版本 ${version}`}>v{version}</span>
        </div>
        <div 
          className={`usage-guide ${isUsageGuideCollapsed ? 'collapsed' : ''}`} 
          id="usageGuide"
          aria-hidden={isUsageGuideCollapsed}
        >
          <div className="usage-steps" role="region" aria-label="使用指南">
            <div className="usage-step">
              <span className="step-number" aria-hidden="true">1</span>
              <div className="step-content">
                <span className="step-title">{t.usageStep1}</span>
                <span className="step-desc">{t.usageStep1Desc}</span>
              </div>
            </div>
            <div className="usage-step">
              <span className="step-number" aria-hidden="true">2</span>
              <div className="step-content">
                <span className="step-title">{t.usageStep2}</span>
                <span className="step-desc">{t.usageStep2Desc}</span>
              </div>
            </div>
            <div className="usage-step">
              <span className="step-number" aria-hidden="true">3</span>
              <div className="step-content">
                <span className="step-title">{t.usageStep3}</span>
                <span className="step-desc">{t.usageStep3Desc}</span>
              </div>
            </div>
          </div>
          <div className="usage-tip" role="note">
            <span className="tip-label">{t.usageTip}</span>
            <span className="tip-content">{t.usageTipContent}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
