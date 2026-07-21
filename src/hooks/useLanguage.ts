// src/hooks/useLanguage.ts v3.7.0
import { useState, useEffect } from 'react';
import { supportedLanguages, getTranslation } from '../utils/i18n';
import { Translation } from '../types';

export const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState('zh-cn');

  // 初始化语言
  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    setCurrentLang(savedLang || 'zh-cn');
  }, []);

  // 获取当前语言的翻译
  const t = getTranslation(currentLang) as Translation;

  // 切换语言
  const switchLang = (lang: string) => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  };

  return {
    currentLang,
    supportedLanguages,
    t,
    switchLang
  };
};