// src/types/index.ts v3.7.41

export type FormatType = 'hosts' | 'dnsmasq' | 'adguard' | 'whitelist';

export interface OutputContent {
  dnsmasq: string;
  hosts: string;
  adguard: string;
  whitelist: string;
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
  dnsmasqFilename: string;
  hostsFilename: string;
  adguardFilename: string;
  whitelistFilename: string;
}

export interface Translation {
  subtitle: string;
  inputTitle: string;
  advanced: string;
  domainCount: string;
  blacklistCount: string;
  whitelistCount: string;
  validCount: string;
  commentCount: string;
  urlPlaceholder: string;
  fetchBtn: string;
  addUrl: string;
  sortUrlBtn: string;
  fetchAllUrls: string;
  presetLabel: string;
  builtinAd: string;
  adguard: string;
  easylist: string;
  neohosts: string;
  inputPlaceholder: string;
  clearBtn: string;
  sortBtn: string;
  parseBtn: string;
  dedupeBtn: string;
  saveBtn: string;
  outputTitle: string;
  adguardFormat: string;
  whitelistFormat: string;
  settingsTitle: string;
  projectName: string;
  version: string;
  ipV4: string;
  ipV6: string;
  headerComment: string;
  blockIPv6: string;
  dedup: string;
  removeWildcard: string;
  mergeInfo: string;
  previewPlaceholder: string;
  generateBtn: string;
  downloadBtn: string;
  copyBtn: string;
  usageToggle: string;
  usageStep1: string;
  usageStep1Desc: string;
  usageStep2: string;
  usageStep2Desc: string;
  usageStep3: string;
  usageStep3Desc: string;
  usageTip: string;
  usageTipContent: string;
  lightMode: string;
  darkMode: string;
  inputHelp: string;
  urlHelp: string;
  removeUrlAria: string;
  githubLinkAria: string;
  changelogLinkAria: string;
  // 悬停在 GitHub 链接上时显示的提示文案（如「如果对你有帮助，请给项目点个 Star ⭐」）
  starPrompt: string;
  starLink?: string;
  starLinkAria?: string;
  hostsFormat: string;
  dnsmasqFormat: string;
  mergeStats: string;
  versionLabel: string;
  languageSelectorAria: string;
  statsAria: string;
  editorActionsAria: string;
  outputActionsAria: string;
  outputFormatAria: string;
  urlActionsAria: string;
  urlListAria: string;
  usageGuideAria: string;
  header: {
    dnsmasqTitle: string;
    description: string;
    hostsTitle: string;
    hostsDescription: string;
    adguardTitle: string;
    adguardDescription: string;
    usage: string;
    merlinUsage: string;
    openwrtUsage: string;
    hostsUsage: string;
    version: string;
    update: string;
    domains: string;
    uniqueDomains: string;
    whitelist: string;
    domainsCount: string;
    project: string;
    demo: string;
  };
  whitelist: {
    title: string;
    label: string;
    hostsNote?: string;
  };
  toast: {
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
  };
}

export interface Language {
  code: string;
  name: string;
  icon: string;
}



