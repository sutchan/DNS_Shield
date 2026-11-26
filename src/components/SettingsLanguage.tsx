// src/components/SettingsLanguage.tsx v3.22.1
// 设置弹窗内的语言切换控件（v3.22.1 由 Header 顶栏迁入）。
// 使用原生 select 而非 Radix DropdownMenu：避免弹窗焦点陷阱与 portal 内容冲突。
'use client';
import * as React from 'react';
import { Language } from '../types';
import type { Translation } from '../types/translation';

interface SettingsLanguageProps {
  currentLang: string;
  supportedLanguages: Language[];
  switchLang: (lang: string) => void;
  t: Translation;
}

const SettingsLanguage: React.FC<SettingsLanguageProps> = ({
  currentLang,
  supportedLanguages,
  switchLang,
  t,
}) => (
  <div className="settings-group" id="settings-group-language">
    <label className="settings-group-title" htmlFor="settings-language-select">
      {t.languageSelectorAria}
    </label>
    <select
      id="settings-language-select"
      className="settings-language-select"
      value={currentLang}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => switchLang(e.target.value)}
    >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
      ))}
    </select>
  </div>
);

export default SettingsLanguage;
