// src/components/Header.tsx v2.3.0
// - 使用 shadcn/ui: Button, DropdownMenu
// - 完整类型注解，移除 t: any
// - 键盘可达性 (Enter / Space 触发)
'use client';

import * as React from 'react';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { Translation, Language } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  currentLang: string;
  supportedLanguages: Language[];
  t: Translation;
  toggleTheme: () => void;
  switchLang: (lang: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  currentLang,
  supportedLanguages,
  t,
  toggleTheme,
  switchLang,
}) => {
  const current = supportedLanguages.find((lang) => lang.code === currentLang);
  const currentIcon = current?.icon || '🌐';
  const currentName = current?.name || currentLang;

  return (
    <header
      className="app-header"
      id="app-header"
      role="banner"
    >
      <div className="header-main">
        <h1 id="app-title" className="app-title">
          <span aria-hidden="true">🛡️</span>
          <span className="ml-2">DNS Shield</span>
        </h1>

        <div className="header-actions">
          {/* 语言选择器 - shadcn DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lang-selector-btn"
                aria-label={t.settingsTitle}
                id="lang-selector-btn"
              >
                <span className="lang-icon" aria-hidden="true">{currentIcon}</span>
                <span className="lang-name">{currentName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="lang-selector-dropdown">
              {supportedLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onSelect={() => switchLang(lang.code)}
                  className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                  role="option"
                  aria-selected={currentLang === lang.code}
                >
                  <span className="lang-icon" aria-hidden="true">{lang.icon || ''}</span>
                  <span className="lang-name">{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 主题切换按钮 - shadcn Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            id="theme-toggle-btn"
            className="theme-toggle"
          >
            <span className="theme-icon text-lg" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </Button>
        </div>
      </div>

      <p className="subtitle" id="app-subtitle">
        {t.subtitle}
      </p>
    </header>
  );
};

export default Header;
