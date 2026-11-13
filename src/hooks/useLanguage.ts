// src/hooks/useLanguage.ts v3.19.0
import { useState, useEffect, useMemo } from 'react';
import { supportedLanguages, getTranslation } from '../utils/i18n';
import { Translation } from '../types';

/** 同步 <html> 的 lang 与 dir：16 语言站必须让屏幕阅读器与 SEO 拿到真实语言，
 *  RTL 语言（ar）首屏即生效，避免刷新后方向跳动（T-UI-01）。 */
const applyDocumentLocale = (lang: string) => {
  if (typeof document === 'undefined') return;
  const found = supportedLanguages.find((l) => l.code === lang);
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('dir', found?.rtl ? 'rtl' : 'ltr');
};

/** 语言偏好来自 localStorage / 调用方，必须按支持清单做枚举校验后再落地，
 *  否则非法值会让 currentLang、切换菜单高亮与翻译结果三者不一致。 */
const normalizeLang = (lang: string): string =>
  supportedLanguages.some((l) => l.code === lang) ? lang : 'zh-cn';

export const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState('zh-cn');

  // 初始化语言
  useEffect(() => {
    let savedLang = '';
    try { savedLang = localStorage.getItem('lang') ?? ''; } catch { /* 隐私模式不可用 */ }
    const lang = normalizeLang(savedLang || 'zh-cn');
    setCurrentLang(lang);
    // 初始化时同步语言与方向：首屏内联脚本已先行设置，此处保持一致（T-UI-01）
    applyDocumentLocale(lang);
  }, []);

  // 获取当前语言的翻译（useMemo 缓存，currentLang 不变则跳过深合并计算）
  const t = useMemo(() => getTranslation(currentLang) as Translation, [currentLang]);

  // 切换语言
  const switchLang = (lang: string) => {
    const safeLang = normalizeLang(lang);
    setCurrentLang(safeLang);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('lang', safeLang); } catch { /* 隐私模式不可用 */ }
      applyDocumentLocale(safeLang);
    }
  };

  return {
    currentLang,
    supportedLanguages,
    t,
    switchLang
  };
};




