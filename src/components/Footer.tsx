// src/components/Footer.tsx v3.8.1
'use client';
import React from 'react';
import { useT } from '../context/AppContext';
import { APP_VERSION } from '../config/version';

interface FooterProps {
  version?: string;
}

const Footer: React.FC<FooterProps> = ({
  version = APP_VERSION
}) => {
  const t = useT();

  return (
    <footer className="app-footer" id="about-panel" role="contentinfo">
      <div className="footer-content" id="footer-content">
        <div className="footer-top" id="footer-top">
          <a 
            href="https://github.com/sutchan/DNS_Shield" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link" 
            id="github-link"
            aria-label={t.githubLinkAria}
            title={t.starPrompt}
          >
            GitHub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <a
            href="https://github.com/sutchan/DNS_Shield"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-star-link"
            id="github-star-link"
            aria-label={t.starLinkAria ?? t.githubLinkAria}
            title={t.starPrompt}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>{t.starLink ?? 'Star'}</span>
          </a>
          <a 
            href="https://github.com/sutchan/DNS_Shield/blob/main/CHANGELOG.md" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link" 
            id="changelog-link"
            aria-label={t.changelogLinkAria}
          >
            {t.changelogLabel ?? '更新日志'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <span className="footer-version" id="version-display" aria-label={`${t.versionLabel} ${version}`}>v{version}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




