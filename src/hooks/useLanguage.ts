// src/hooks/useLanguage.ts v3.18.1
import { useState, useEffect, useMemo } from 'react';
import { supportedLanguages, getTranslation } from '../utils/i18n';
import { Translation } from '../types';

/** 依据语言代码设置 <html dir>，确保 RTL 语言（如阿拉伯语）布局正确 */
const applyDocumentDirection = (lang: string) => {
  if (typeof document === 'undefined') return;
  const found = supportedLanguages.find((l) => l.code === lang);
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
    // 初始化时同步方向：否则 RTL 语言用户刷新后首屏仍按 LTR 排版（T-P1-12）
    applyDocumentDirection(lang);
  }, []);

  // 获取当前语言的翻译（useMemo 缓存，currentLang 不变则跳过深合并计算）
  const t = useMemo(() => getTranslation(currentLang) as Translation, [currentLang]);

  // 切换语言
  const switchLang = (lang: string) => {
    const safeLang = normalizeLang(lang);
    setCurrentLang(safeLang);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('lang', safeLang); } catch { /* 隐私模式不可用 */ }
      applyDocumentDirection(safeLang);
    }
  };

  return {
    currentLang,
    supportedLanguages,
    t,
    switchLang
  };
};




