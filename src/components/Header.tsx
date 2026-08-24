// src/components/Header.tsx v3.9.0
'use client';

import * as React from 'react';
import { Sun, Moon, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
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

  // 分享：随机取一条分享文案 + 项目链接，复制到剪贴板（对齐原型 shareBtn / shareTexts）
  const handleShare = () => {
    const texts = (t.shareTexts && t.shareTexts.length ? t.shareTexts : [t.shareTitle]) as string[];
    const text = texts[Math.floor(Math.random() * texts.length)] + ' https://github.com/sutchan/DNS_Shield';
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast.success(t.copied),
        () => toast.error(t.toast.copyFailed)
      );
    } else {
      toast.error(t.toast.copyFailed);
    }
  };

  return (
    <header className="app-header" id="app-header" role="banner">
      <div className="header-top" id="header-top">
        <div className="header-brand" id="header-brand">
          {/* 品牌图标：统一引用品牌单一来源 /logo.svg（与 brand/logo.svg 同源） */}
          <div className="brand-icon" aria-hidden="true">
            <img
              src="/logo.svg"
              alt="DNS Shield"
              className="h-6 w-6"
              width={24}
              height={24}
            />
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

          {/* Share */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label={t.shareBtn}
            title={t.shareTitle}
            id="shareBtn"
          >
            <svg className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
            </svg>
          </Button>

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




