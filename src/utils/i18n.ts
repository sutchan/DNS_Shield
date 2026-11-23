// src/utils/i18n.ts v3.20.1
// 国际化翻译加载与语言清单。
// v3.19.1：15 个非基准语言改为显式动态 import()，首屏包仅含 zh-cn（约 12KB，
//   原全量静态 import 约 191KB）；getTranslation 保持同步签名（未加载回退基准），
//   新增 loadTranslation(lang) 异步加载并写入缓存，由 useLanguage 在挂载/切换时调用。
import zhCN from '../locales/zh-cn.json';
import { Language, Translation } from '../types';
import { logger } from './logger';

/**
 * 非基准语言的显式动态 loader 映射（Next.js 14 webpack 不支持 Vite 的 import.meta.glob）。
 * 新增语言时须同时：① 在此登记 loader；② 加入下方 supportedLanguages；③ 增补 locale JSON。
 */
const localeLoaders: Record<string, () => Promise<{ default: Translation }>> = {
  en: () => import('../locales/en.json').then((m) => ({ default: m.default as unknown as Translation })),
  'zh-tw': () => import('../locales/zh-tw.json').then((m) => ({ default: m.default as unknown as Translation })),
  ar: () => import('../locales/ar.json').then((m) => ({ default: m.default as unknown as Translation })),
  cs: () => import('../locales/cs.json').then((m) => ({ default: m.default as unknown as Translation })),
  es: () => import('../locales/es.json').then((m) => ({ default: m.default as unknown as Translation })),
  hi: () => import('../locales/hi.json').then((m) => ({ default: m.default as unknown as Translation })),
  id: () => import('../locales/id.json').then((m) => ({ default: m.default as unknown as Translation })),
  it: () => import('../locales/it.json').then((m) => ({ default: m.default as unknown as Translation })),
  nl: () => import('../locales/nl.json').then((m) => ({ default: m.default as unknown as Translation })),
  pl: () => import('../locales/pl.json').then((m) => ({ default: m.default as unknown as Translation })),
  sv: () => import('../locales/sv.json').then((m) => ({ default: m.default as unknown as Translation })),
  th: () => import('../locales/th.json').then((m) => ({ default: m.default as unknown as Translation })),
  tr: () => import('../locales/tr.json').then((m) => ({ default: m.default as unknown as Translation })),
  ru: () => import('../locales/ru.json').then((m) => ({ default: m.default as unknown as Translation })),
  vi: () => import('../locales/vi.json').then((m) => ({ default: m.default as unknown as Translation })),
};

/** 语言映射：zh-cn 同步可用；其余语言在 loadTranslation 后填充（深合并结果） */
export const translations: Record<string, Translation> = {
  'zh-cn': zhCN as unknown as Translation,
};

// 支持的语言列表（v3.17.0 规范：默认简体中文第一、繁体中文第二、英语第三，
// 其余语言按原顺序跟随；切换菜单、useLanguage 校验均以此顺序为准）
export const supportedLanguages: Language[] = [
  { code: 'zh-cn', name: '中文简体', icon: '' },
  { code: 'zh-tw', name: '中文繁體', icon: '' },
  { code: 'en', name: 'English', icon: '' },
  { code: 'ar', name: 'العربية', icon: '', rtl: true },
  { code: 'cs', name: 'Čeština', icon: '' },
  { code: 'es', name: 'Español', icon: '' },
  { code: 'hi', name: 'हिन्दी', icon: '' },
  { code: 'id', name: 'Bahasa Indonesia', icon: '' },
  { code: 'it', name: 'Italiano', icon: '' },
  { code: 'nl', name: 'Nederlands', icon: '' },
  { code: 'pl', name: 'Polski', icon: '' },
  { code: 'sv', name: 'Svenska', icon: '' },
  { code: 'th', name: 'ไทย', icon: '' },
  { code: 'tr', name: 'Türkçe', icon: '' },
  { code: 'ru', name: 'Русский', icon: '' },
  { code: 'vi', name: 'Tiếng Việt', icon: '' },
];

// 深合并：以 zh-cn 为基准，叠加目标语言，确保嵌套键（header/toast/whitelist）始终存在，
// 避免某个 locale 缺键时 t.header.dnsmasqTitle 等访问抛 undefined 崩溃。
const deepMerge = <T>(base: T, override: Partial<T>): T => {
  if (Array.isArray(base)) {
    return [...(base as unknown as unknown[])] as unknown as T;
  }
  const result: Record<string, unknown> = { ...(base as unknown as Record<string, unknown>) };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const ov = override[key] as unknown;
    const bv = (base as unknown as Record<string, unknown>)[key as string];
    if (
      ov && typeof ov === 'object' && !Array.isArray(ov) &&
      bv && typeof bv === 'object' && !Array.isArray(bv)
    ) {
      result[key as string] = deepMerge(bv as Record<string, unknown>, ov as Record<string, unknown>) as unknown;
    } else if (ov !== undefined) {
      result[key as string] = ov;
    }
  }
  return result as unknown as T;
};

// 获取翻译（同步）：已加载语言返回深合并结果；未加载 / 未知语言回退 zh-cn 基准。
// 保持同步签名，测试与 rulesGenerator 等既有调用方无需改动。
export const getTranslation = (lang: string): Translation => {
  const base = translations['zh-cn'];
  const target = translations[lang];
  if (!target || lang === 'zh-cn') return base;
  return target;
};

/**
 * 异步加载指定语言并写入缓存；重复调用直接返回已缓存结果。
 * useLanguage 在挂载初始化与切换语言时调用，保证 currentLang / <html lang> / 可见 t 三者同步。
 */
export const loadTranslation = async (lang: string): Promise<Translation> => {
  if (lang === 'zh-cn' || translations[lang]) return getTranslation(lang);
  const loader = localeLoaders[lang];
  if (!loader) return getTranslation(lang);
  try {
    const localeModule = await loader();
    translations[lang] = deepMerge(translations['zh-cn'], localeModule.default) as Translation;
  } catch (error) {
    // 语言包加载失败（网络 / 分块缺失）：回退基准，不阻断界面
    logger.warn(`[i18n] 语言包 ${lang} 加载失败，回退简体中文`, error);
    return getTranslation('zh-cn');
  }
  return getTranslation(lang);
};

/**
 * v3.20.1：目标语言包是否真正加载成功。
 * loadTranslation 在分块加载失败时回退中文正文但不改变 translations 缓存，
 * 调用方须用本函数判定是否可以把 <html lang|dir> 切到目标语言——
 * 否则会出现「中文正文 + dir=rtl + lang=ar」的错配（诊断 P1-5）。
 */
export const isLanguageLoaded = (lang: string): boolean =>
  lang === 'zh-cn' || Boolean(translations[lang]);
