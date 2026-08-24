// src/types/index.ts v3.9.0
// 全局类型定义集中处：Settings / ParsedData / OutputContent 等。
// FormatType 已拆分至 formats.ts，此处统一 re-export 以保持外部契约不变。
import type { FormatType } from './formats';
export type { FormatType } from './formats';

export interface OutputContent {
  dnsmasq: string;
  hosts: string;
  adguard: string;
  whitelist: string;
  unbound: string;
  pihole: string;
  domains: string;
  bind: string;
  smartdns: string;
}

export interface CustomDnsEntry {
  domain: string;
  ip: string;
}

export interface ParsedData {
  domains: string[];
  whitelist: string[];
  customDns: CustomDnsEntry[];
}

export interface Stats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
  customDnsCount: number;
  totalLines: number;
  invalidCount: number;
}

export interface Settings {
  projectName: string;
  version: string;
  ipv4: string;
  ipv6: string;
  addHeader: boolean;
  blockIPv6: boolean;
  dedupDomains: boolean;
  removeWildcard: boolean;
  // AdGuard 黑名单是否包含白名单豁免规则（@@||domain^）。
  // 默认 true（保持向后兼容：历史版本始终在 AdGuard 黑名单中附带白名单）。
  adguardIncludeWhitelist: boolean;
  // 格式 Tab 是否显示全部 9 种格式；为 false 时仅显示核心 4 种（hosts/dnsmasq/adguard/whitelist）。
  // 对齐原型「输出规则类型」显示/隐藏开关，默认 true（显示全部）。
  showAllFormats: boolean;
  // 逐格式可见性集合（对齐原型「输出规则类型」9 个独立显示/隐藏开关 .box.on）。
  // 为空表示全部可见；含字段则仅列出字段可见。与 showAllFormats 配合：
  // 当 showAllFormats=false 时取 CORE_FORMATS 交集，true 时取 ALL_FORMATS 交集。
  visibleFormats: FormatType[];
  dnsmasqFilename: string;
  hostsFilename: string;
  adguardFilename: string;
  whitelistFilename: string;
  unboundFilename: string;
  piholeFilename: string;
  domainsFilename: string;
  bindFilename: string;
  smartdnsFilename: string;
}

// Translation 已拆分至 translation.ts，统一 re-export 以保持外部契约不变。
export type { Translation } from './translation';

export interface Language {
  code: string;
  name: string;
  icon: string;
  // 是否为从右到左书写语言（如阿拉伯语），用于切换 <html dir="rtl"> 布局。
  rtl?: boolean;
}



