// src/types/formats.ts v3.7.50
// 输出格式枚举与格式分类常量，从 index.ts 拆分以保持类型定义文件单一职责。
// 格式键均一一对应 rulesGenerator 的 generateRules 输出字段。

/** 支持的输出格式类型 */
export type FormatType =
  | 'hosts'
  | 'dnsmasq'
  | 'adguard'
  | 'whitelist'
  | 'unbound'
  | 'pihole'
  | 'domains'
  | 'bind'
  | 'smartdns';

/** 全部可生成格式（顺序与 UI Tab 一致） */
export const ALL_FORMATS: FormatType[] = [
  'hosts',
  'dnsmasq',
  'adguard',
  'whitelist',
  'unbound',
  'pihole',
  'domains',
  'bind',
  'smartdns',
];

/** 带拦截语义（黑洞/拒绝）的格式，统计时计入黑名单计数 */
export const MASKED_FORMATS: FormatType[] = [
  'hosts',
  'dnsmasq',
  'adguard',
  'unbound',
  'pihole',
  'domains',
  'bind',
  'smartdns',
];

/** 仅用于白名单呈现的格式 */
export const WHITELIST_FORMATS: FormatType[] = ['whitelist'];
