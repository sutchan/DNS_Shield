// src/components/Footer.tsx v2.2.1
import React from 'react';

interface FooterProps {
  t: any;
  version: string;
}

const Footer: React.FC<FooterProps> = ({
  t,
  version
}) => {
  return (
    <footer className="app-footer" id="about-panel">
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
        <span className="footer-version">v{version}</span>
      </div>
    </footer>
  );
};

export default Footer;