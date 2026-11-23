// src/hooks/useLanguage.ts v3.20.1
import { useState, useEffect, useRef } from 'react';
import { supportedLanguages, getTranslation, loadTranslation, isLanguageLoaded } from '../utils/i18n';
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
  // v3.19.1：译文改为 state 持有；异步加载完成后与 currentLang / <html lang|dir> 一起落地
  const [t, setT] = useState<Translation>(() => getTranslation('zh-cn') as Translation);
  // 序号守卫：初始化与切换共用，避免 init 后到覆盖用户已切换的语言（诊断 P1-4）
  const seqRef = useRef(0);

  // 初始化语言：加载完成后一次性更新 currentLang / t / 文档语言声明
  useEffect(() => {
    const seq = ++seqRef.current;
    const init = async () => {
      let savedLang = '';
      try { savedLang = localStorage.getItem('lang') ?? ''; } catch { /* 隐私模式不可用 */ }
      const requested = normalizeLang(savedLang || 'zh-cn');
      const loaded = await loadTranslation(requested);
      // 过期请求丢弃：用户在 init 完成前已手动切换语言
      if (seq !== seqRef.current) return;
      // v3.20.1：语言包加载失败时保持文档语言为简中，避免中文正文 + RTL 错配
      const landed = isLanguageLoaded(requested) ? requested : 'zh-cn';
      setCurrentLang(landed);
      setT(loaded as Translation);
      applyDocumentLocale(landed);
    };
    void init();
    // 不设置 cancelled：卸载后的 setState 在 React 18 无警告，且 seqRef 已防止过期落地
  }, []);

  // 切换语言：先异步加载目标语言包，加载完成后三者同步落地
  const switchLang = (lang: string) => {
    const safeLang = normalizeLang(lang);
    const seq = ++seqRef.current;
    void loadTranslation(safeLang).then((loaded) => {
      if (seq !== seqRef.current) return;
      // 分块加载失败：正文回退中文，文档语言也须回退简中，不得留下 dir=rtl 错配
      const landed = isLanguageLoaded(safeLang) ? safeLang : 'zh-cn';
      setCurrentLang(landed);
      setT(loaded as Translation);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('lang', landed); } catch { /* 隐私模式不可用 */ }
        applyDocumentLocale(landed);
      }
    });
  };

  return {
    currentLang,
    supportedLanguages,
    t,
    switchLang
  };
};
