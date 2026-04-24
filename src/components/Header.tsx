// src/components/Header.tsx v2.2.5
import React from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  currentLang: string;
  isLangDropdownOpen: boolean;
  supportedLanguages: Array<{ code: string; name: string; icon: string }>;
  t: any;
  toggleTheme: () => void;
  switchLang: (lang: string) => void;
  setIsLangDropdownOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  currentLang,
  isLangDropdownOpen,
  supportedLanguages,
  t,
  toggleTheme,
  switchLang,
  setIsLangDropdownOpen
}) => {
  return (
    <header className="app-header">
      <div className="header-main">
        <h1>🛡️ DNS Shield</h1>
        <div className="header-actions">
          <div className="lang-selector">
            <button 
              className="lang-selector-btn" 
              title={t.settingsTitle}
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            >
              <span className="lang-icon">{supportedLanguages.find(lang => lang.code === currentLang)?.icon || ''}</span>
              <span className="lang-name">{supportedLanguages.find(lang => lang.code === currentLang)?.name || currentLang}</span>
            </button>
            {isLangDropdownOpen && (
              <div className="lang-selector-dropdown">
                {supportedLanguages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      switchLang(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <span className="lang-icon">{lang.icon || ''}</span>
                    <span className="lang-name">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title={t.settingsTitle}>
            <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
      <p className="subtitle">{t.subtitle}</p>
    </header>
  );
};

export default Header;