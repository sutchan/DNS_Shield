// src/components/Header.tsx v3.22.1
// 顶栏：品牌 / 分享 / 设置入口。
// v3.22.1：语言切换与明暗切换移入设置弹窗，顶栏只保留分享与设置（减少视觉噪音）。
'use client';

import * as React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import { useT } from '../context/AppContext';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const t = useT();

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
            <Image
              src="/logo.svg"
              alt="DNS Shield"
              className="h-6 w-6"
              width={24}
              height={24}
              unoptimized
            />
          </div>
          <div>
            {/* 品牌名用 p 而非 h1：页面唯一主标题是 Hero 的 hero-title，避免双 h1（a11y/SEO） */}
            <p className="app-title" aria-describedby="app-subtitle">DNS Shield</p>
            <p className="app-subtitle" id="app-subtitle">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" id="header-actions">
          {/* Share */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label={t.shareBtn}
            title={t.shareTitle}
            id="share-btn"
          >
            <svg className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
            </svg>
          </Button>

          {/* Settings（对齐原型 settingsBtn，触发弹窗） */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenSettings}
            aria-label={t.settingsTitle}
            title={t.settingsTitle}
            id="settings-btn"
          >
            <svg className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;




