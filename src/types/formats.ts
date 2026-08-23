// src/types/formats.ts v3.8.0
// 输出格式枚举与格式分类常量，从 index.ts 拆分以保持类型定义文件单一职责。
// 格式键均一一对应 rulesGenerator 的 generateRules 输出字段。
// 同时集中解析结果/统计类型（原散落于 domainPrimitives，现归一此处）。

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

/** 核心格式：当设置「仅显示核心格式」(showAllFormats=false) 时，
 *  格式 Tab 仅展示这 4 种最常用的黑名单/白名单格式，隐藏高级格式。
 *  顺序与 ALL_FORMATS 一致。 */
export const CORE_FORMATS: FormatType[] = [
  'hosts',
  'dnsmasq',
  'adguard',
  'whitelist',
];

/** 单行解析结果：区分空行 / 注释 / 各类格式命中 */
export interface ParseResult {
  type: 'empty' | 'comment' | 'whitelist' | 'customDns' | 'hosts' | 'dnsmasq' | 'adguard' | 'domain';
  domain?: string;
  ip?: string;
  isValid?: boolean;
  originalLine: string;
}

/** 解析源文本后的统计聚合，与真实注释/空行分开计数，避免数字失真 */
export interface ParseStats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
  // 解析失败/格式无效的行数（如非法白名单、非法 customDns、非法域名），
  // 与真实注释/空行分开统计，避免 stats 数字失真
  invalidCount: number;
}
