// src/hooks/useLanguage.ts v2.2.5
import { useState, useEffect, useRef } from 'react';
import { supportedLanguages, getTranslation, isChineseLanguage } from '../utils/i18n';
import { Translation } from '../types';

export const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState('zh-cn');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langSelectorRef = useRef<HTMLDivElement>(null);

  // 初始化语言
  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    setCurrentLang(savedLang || 'zh-cn');
  }, []);

  // 监听点击事件，点击其他地方关闭语言选择器下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const langSelector = document.querySelector('.lang-selector');
      if (langSelector && !langSelector.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  // 获取当前语言的翻译
  const t = getTranslation(currentLang) as Translation;

  // 检查是否为中文语言
  const isLangZh = isChineseLanguage(currentLang);

  // 切换语言
  const switchLang = (lang: string) => {
    setCurrentLang(lang);
    // 确保在客户端环境中使用localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  };

  return {
    currentLang,
    isLangDropdownOpen,
    setIsLangDropdownOpen,
    supportedLanguages,
    t,
    isLangZh,
    switchLang
  };
};