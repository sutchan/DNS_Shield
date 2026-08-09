// src/utils/i18n.ts v3.7.5
import ar from '../locales/ar.json';
import cs from '../locales/cs.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';
import id from '../locales/id.json';
import it from '../locales/it.json';
import nl from '../locales/nl.json';
import pl from '../locales/pl.json';
import sv from '../locales/sv.json';
import th from '../locales/th.json';
import tr from '../locales/tr.json';
import ru from '../locales/ru.json';
import vi from '../locales/vi.json';
import zhCN from '../locales/zh-cn.json';
import zhTW from '../locales/zh-tw.json';
import { Language, Translation } from '../types';

// 语言映射
export const translations: Record<string, Translation> = {
  ar,
  cs,
  en,
  es,
  hi,
  id,
  it,
  nl,
  pl,
  sv,
  th,
  tr,
  ru,
  vi,
  'zh-cn': zhCN,
  'zh-tw': zhTW
};

// 支持的语言列表
export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', icon: '' },
  { code: 'zh-cn', name: '中文简体', icon: '' },
  { code: 'zh-tw', name: '中文繁體', icon: '' },
  { code: 'ar', name: 'العربية', icon: '' },
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
  { code: 'vi', name: 'Tiếng Việt', icon: '' }
];

// 深合并：以 zh-cn 为基准，叠加目标语言，确保嵌套键（header/toast/whitelist）始终存在，
// 避免某个 locale 缺键时 t.header.dnsmasqTitle 等访问抛 undefined 崩溃。
const deepMerge = <T>(base: T, override: Partial<T>): T => {
  const result: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const ov = override[key] as any;
    const bv = (base as any)[key];
    if (
      ov && typeof ov === 'object' && !Array.isArray(ov) &&
      bv && typeof bv === 'object' && !Array.isArray(bv)
    ) {
      result[key] = deepMerge(bv, ov);
    } else if (ov !== undefined) {
      result[key] = ov;
    }
  }
  return result;
};

// 获取翻译
export const getTranslation = (lang: string): Translation => {
  const base = translations['zh-cn'];
  const target = translations[lang];
  if (!target || lang === 'zh-cn') return base;
  return deepMerge(base, target) as Translation;
};
