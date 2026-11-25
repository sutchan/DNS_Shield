// src/config/languages.ts v3.22.0
// 语言代码白名单单一来源：首屏内联脚本、useLanguage 校验与 i18n 列表共用，
// 避免新增/删除语言时内联脚本白名单与运行时列表脱节（T-AUD-L03）。
export const LANGUAGE_CODES = [
  'zh-cn', 'zh-tw', 'en', 'ar', 'cs', 'es', 'hi',
  'id', 'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi',
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

/** 供内联脚本使用的正则字面量（不含 / 定界符），由白名单派生 */
export const LANGUAGE_CODE_PATTERN = `^(${LANGUAGE_CODES.join('|')})$`;

export const isSupportedLanguageCode = (value: string): value is LanguageCode =>
  (LANGUAGE_CODES as readonly string[]).includes(value);
