// src/types/index.ts v3.7.65
// 全局类型定义集中处：Settings / ParsedData / OutputContent 等。
// FormatType 已拆分至 formats.ts，此处统一 re-export 以保持外部契约不变。
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
}



