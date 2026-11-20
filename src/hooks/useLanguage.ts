// src/hooks/useLanguage.ts v3.19.1
import { useState, useEffect, useRef } from 'react';
import { supportedLanguages, getTranslation, loadTranslation } from '../utils/i18n';
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
  // 序号守卫：快速连续切换时只让最后一次请求落地，避免旧语言包后到覆盖新语言
  const seqRef = useRef(0);

  // 初始化语言：加载完成后一次性更新 currentLang / t / 文档语言声明
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      let savedLang = '';
      try { savedLang = localStorage.getItem('lang') ?? ''; } catch { /* 隐私模式不可用 */ }
      const lang = normalizeLang(savedLang || 'zh-cn');
      const loaded = await loadTranslation(lang);
      if (cancelled) return;
      setCurrentLang(lang);
      setT(loaded as Translation);
      // 初始化时同步语言与方向：首屏内联脚本已先行设置，此处保持一致（T-UI-01）
      applyDocumentLocale(lang);
    };
    void init();
    return () => { cancelled = true; };
  }, []);

  // 切换语言：先异步加载目标语言包，加载完成后三者同步落地
  const switchLang = (lang: string) => {
    const safeLang = normalizeLang(lang);
    const seq = ++seqRef.current;
    void loadTranslation(safeLang).then((loaded) => {
      // 过期请求丢弃：只让最后一次切换生效
      if (seq !== seqRef.current) return;
      setCurrentLang(safeLang);
      setT(loaded as Translation);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('lang', safeLang); } catch { /* 隐私模式不可用 */ }
        applyDocumentLocale(safeLang);
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
