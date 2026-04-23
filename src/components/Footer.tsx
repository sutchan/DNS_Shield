// src/components/Footer.tsx v2.2.1
import React from 'react';
import { Settings } from '../types';

interface FooterProps {
  isUsageGuideCollapsed: boolean;
  settings: Settings;
  t: any;
  toggleSection: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({
  isUsageGuideCollapsed,
  settings,
  t,
  toggleSection
}) => {
  return (
    <footer className="app-footer" id="about-panel">
      <button className="usage-toggle" id="usageToggle" onClick={() => toggleSection('usage-guide')}>
        <span id="usageToggleText">{t.usageToggle}</span>
        <svg className="toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div className={`usage-guide ${isUsageGuideCollapsed ? 'collapsed' : ''}`} id="usageGuide">
        <div className="usage-steps">
          <div className="usage-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <span className="step-title">{t.usageStep1}</span>
              <span className="step-desc">{t.usageStep1Desc}</span>
            </div>
          </div>
          <div className="usage-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <span className="step-title">{t.usageStep2}</span>
              <span className="step-desc">{t.usageStep2Desc}</span>
            </div>
          </div>
          <div className="usage-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <span className="step-title">{t.usageStep3}</span>
              <span className="step-desc">{t.usageStep3Desc}</span>
            </div>
          </div>
        </div>
        <div className="usage-tip">
          <span className="tip-label">{t.usageTip}</span>
          <span className="tip-content">{t.usageTipContent}</span>
        </div>
      </div>
      <div className="footer-content">
        <a href="https://github.com/sutchan/DNS_Shield" target="_blank" className="footer-link">
          GitHub
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
        <a href="https://dns.ewuse.com/" target="_blank" className="footer-link">
          Demo
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
        <span className="footer-version">v{settings.version}</span>
      </div>
    </footer>
  );
};

export default Footer;
