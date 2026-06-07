// src/components/Header.tsx v2.2.8
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
    <header className="app-header" id="app-header" role="banner">
      <div className="header-main">
        <h1 id="app-title">🛡️ DNS Shield</h1>
        <div className="header-actions">
          <div className="lang-selector">
            <button 
              className="lang-selector-btn" 
              title={t.settingsTitle}
              aria-label={t.settingsTitle}
              aria-haspopup="listbox"
              aria-expanded={isLangDropdownOpen}
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              id="lang-selector-btn"
            >
              <span className="lang-icon" aria-hidden="true">
                {supportedLanguages.find(lang => lang.code === currentLang)?.icon || ''}
              </span>
              <span className="lang-name">
                {supportedLanguages.find(lang => lang.code === currentLang)?.name || currentLang}
              </span>
            </button>
            {isLangDropdownOpen && (
              <div 
                className="lang-selector-dropdown" 
                id="lang-dropdown"
                role="listbox"
                aria-label="语言选择"
              >
                {supportedLanguages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                    role="option"
                    aria-selected={currentLang === lang.code}
                    onClick={() => {
                      switchLang(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <span className="lang-icon" aria-hidden="true">{lang.icon || ''}</span>
                    <span className="lang-name">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            className="icon-btn theme-toggle" 
            onClick={toggleTheme} 
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            id="theme-toggle-btn"
          >
            <span className="theme-icon" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="sr-only">
              {theme === 'dark' ? t.lightMode : t.darkMode}
            </span>
          </button>
        </div>
      </div>
      <p className="subtitle" id="app-subtitle">{t.subtitle}</p>
    </header>
  );
};

export default Header;
