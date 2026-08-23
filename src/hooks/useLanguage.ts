// src/hooks/useLanguage.ts v3.8.1
import { useState, useEffect, useMemo } from 'react';
import { supportedLanguages, getTranslation } from '../utils/i18n';
import { Translation } from '../types';

export const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState('zh-cn');

  // 初始化语言
  useEffect(() => {
    let savedLang = '';
    try { savedLang = localStorage.getItem('lang') ?? ''; } catch { /* 隐私模式不可用 */ }
    setCurrentLang(savedLang || 'zh-cn');
  }, []);

  // 获取当前语言的翻译（useMemo 缓存，currentLang 不变则跳过深合并计算）
  const t = useMemo(() => getTranslation(currentLang) as Translation, [currentLang]);

  // 切换语言
  const switchLang = (lang: string) => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('lang', lang); } catch { /* 隐私模式不可用 */ }
      // 根据语言设置 <html dir>，确保 RTL 语言（如阿拉伯语）布局正确。
      const found = supportedLanguages.find((l) => l.code === lang);
      document.documentElement.setAttribute('dir', found?.rtl ? 'rtl' : 'ltr');
    }
  };

  return {
    currentLang,
    supportedLanguages,
    t,
    switchLang
  };
};




