// src/types/translation.parts.ts v3.10.2
// Translation 接口的嵌套子类型，从 translation.ts 抽离以保持主文件单一职责。
// 仅类型定义，不含运行时逻辑；原结构完全保留，公开契约不变。

/** 页头区文案（各输出格式的使用说明与标题） */
export interface TranslationHeader {
  dnsmasqTitle: string;
  description: string;
  hostsTitle: string;
  hostsDescription: string;
  adguardTitle: string;
  adguardDescription: string;
  unboundTitle?: string;
  unboundDescription?: string;
  piholeTitle?: string;
  piholeDescription?: string;
  domainsTitle?: string;
  domainsDescription?: string;
  bindTitle?: string;
  bindDescription?: string;
  smartdnsTitle?: string;
  smartdnsDescription?: string;
  usage: string;
  merlinUsage: string;
  openwrtUsage: string;
  hostsUsage: string;
  unboundUsage?: string;
  piholeUsage?: string;
  domainsUsage?: string;
  bindUsage?: string;
  smartdnsUsage?: string;
  mosdnsTitle?: string;
  mosdnsDescription?: string;
  mosdnsUsage?: string;
  clashTitle?: string;
  clashDescription?: string;
  clashUsage?: string;
  corednsTitle?: string;
  corednsDescription?: string;
  corednsUsage?: string;
  version: string;
  update: string;
  domains: string;
  uniqueDomains: string;
  whitelist: string;
  domainsCount: string;
  project: string;
  demo: string;
}

/** 白名单区文案 */
export interface TranslationWhitelist {
  title: string;
  label: string;
  hostsNote?: string;
}

/** 操作提示（toast）文案 */
export interface TranslationToast {
  rulesGenerated: string;
  downloaded: string;
  copied: string;
  copyFailed: string;
  domainsSorted: string;
  duplicatesRemoved: string;
  domainsSaved: string;
  autosaveRestored: string;
  parseFailed: string;
  urlEnter: string;
  domainsFetched: string;
  fetchFailed: string;
  urlAdded: string;
  urlsSorted: string;
  urlsFetched: string;
  presetLoaded: string;
  presetFailed: string;
  loading: string;
  invalidUrl: string;
  invalidUrlsFiltered: string;
}
