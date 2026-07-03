// src/utils/i18n.ts v3.3.0
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
  { code: 'en', name: 'English', icon: '🇺🇸' },
  { code: 'zh-cn', name: '中文简体', icon: '🇨🇳' },
  { code: 'zh-tw', name: '中文繁體', icon: '🇹🇼' },
  { code: 'ar', name: 'العربية', icon: '🇸🇦' },
  { code: 'cs', name: 'Čeština', icon: '🇨🇿' },
  { code: 'es', name: 'Español', icon: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', icon: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', icon: '🇮🇩' },
  { code: 'it', name: 'Italiano', icon: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', icon: '🇳🇱' },
  { code: 'pl', name: 'Polski', icon: '🇵🇱' },
  { code: 'sv', name: 'Svenska', icon: '🇸🇪' },
  { code: 'th', name: 'ไทย', icon: '🇹🇭' },
  { code: 'tr', name: 'Türkçe', icon: '🇹🇷' },
  { code: 'ru', name: 'Русский', icon: '🇷🇺' },
  { code: 'vi', name: 'Tiếng Việt', icon: '🇻🇳' }
];

// 获取翻译
export const getTranslation = (lang: string): Translation => {
  return translations[lang] || translations['zh-cn'];
};

// 检查是否为中文语言
export const isChineseLanguage = (lang: string): boolean => {
  return lang === 'zh-cn' || lang === 'zh-tw';
};