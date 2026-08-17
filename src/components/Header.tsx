// src/components/Header.tsx v3.7.30
'use client';

import * as React from 'react';
import { Shield, Sun, Moon, Globe, Check } from 'lucide-react';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { Language } from '../types';
import { useT } from '../context/AppContext';

interface HeaderProps {
  theme: 'light' | 'dark';
  currentLang: string;
  supportedLanguages: Language[];
  toggleTheme: () => void;
  switchLang: (lang: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  currentLang,
  supportedLanguages,
  toggleTheme,
  switchLang,
}) => {
  const t = useT();
  const current = supportedLanguages.find((lang) => lang.code === currentLang);
  const currentName = current?.name || currentLang;

  return (
    <header className="app-header" id="app-header" role="banner">
      <div className="header-top" id="header-top">
        <div className="header-brand" id="header-brand">
          <div className="brand-icon" aria-hidden="true">
            <Shield className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <h1 className="app-title" aria-describedby="app-subtitle">DNS Shield</h1>
            <p className="app-subtitle" id="app-subtitle">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" id="header-actions">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                aria-label={t.languageSelectorAria}
                id="lang-selector-btn"
              >
                <Globe className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                <span className="text-sm">{currentName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {supportedLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onSelect={() => switchLang(lang.code)}
                  className={`flex items-center gap-2 ${currentLang === lang.code ? 'text-primary font-medium' : ''}`}
                  role="option"
                  aria-selected={currentLang === lang.code}
                >
                  <span className="flex-1">{lang.name}</span>
                  {currentLang === lang.code && (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;




