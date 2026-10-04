// src/types/translation.ts v3.10.2
// 国际化文案类型定义，从 index.ts 拆分以保持类型文件单一职责。
// 嵌套子类型（header/whitelist/toast）已抽离至 translation.parts.ts 以控制主文件行数。
import type { TranslationHeader, TranslationWhitelist, TranslationToast } from './translation.parts';

export interface Translation {
  subtitle: string;
  inputTitle: string;
  advanced: string;
  domainCount: string;
  blacklistCount: string;
  whitelistCount: string;
  validCount: string;
  commentCount: string;
  invalidCount: string;
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
  adguardIncludeWhitelist: string;
  showAllFormats: string;
  // 流量可视化签名区（对齐原型 flowviz）
  fvTagline: string;
  fvBlock: string;
  fvAllow: string;
  fvDns: string;
  fvAwait: string;
  fvDomains: string;
  mergeInfo: string;
  previewPlaceholder: string;
  // 输出预览统计条（对齐原型 previewStats）
  psFormat: string;
  psLines: string;
  psDomains: string;
  psFormats: string;
  generateBtn: string;
  downloadBtn: string;
  copyBtn: string;
  usageToggle: string;
  usageTitle: string;
  customDnsCount: string;
  totalLines: string;
  step1t: string;
  step1d: string;
  step2t: string;
  step2d: string;
  step3t: string;
  step3d: string;
  lightMode: string;
  darkMode: string;
  inputHelp: string;
  urlHelp: string;
  removeUrlAria: string;
  githubLinkAria: string;
  changelogLinkAria: string;
  changelogLabel?: string;
  // 分享按钮与文案（对齐原型 shareBtn / shareTexts）
  shareBtn: string;
  shareTitle: string;
  copied: string;
  shareTexts: string[];
  // Hero 营销文案（对齐原型 heroKicker / heroTitle / heroDesc）
  heroKicker: string;
  heroTitle: string;
  heroDesc: string;
  // 悬停在 GitHub 链接上时显示的提示文案（如「如果对你有帮助，请给项目点个 Star ⭐」）
  starPrompt: string;
  starLink?: string;
  starLinkAria?: string;
  hostsFormat: string;
  dnsmasqFormat: string;
  unboundFormat?: string;
  piholeFormat?: string;
  domainsFormat?: string;
  bindFormat?: string;
  smartdnsFormat?: string;
  mosdnsFormat?: string;
  clashFormat?: string;
  corednsFormat?: string;
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
  header: TranslationHeader;
  whitelist: TranslationWhitelist;
  toast: TranslationToast;
  // —— 对齐原型 v3.8.1 新增扁平键 ——
  // Hero CTA 按钮（原型 ctaStart/ctaSettings）
  ctaStart: string;
  ctaSettings: string;
  // URL 批量导入（原型 urlHint/lblFetch）
  urlHint: string;
  lblFetch: string;
  // 预设标签（原型 presetBuiltin）
  presetBuiltin: string;
  // 输出格式 tab 标签（原型 tabWhitelist）
  tabWhitelist: string;
  // 设置分组标题（原型 fmtGroup/appearanceGroup/darkTheme/themeLight/themeDark）
  fmtGroup: string;
  appearanceGroup: string;
  themeLight: string;
  themeDark: string;
  closeBtn: string;
  darkTheme: string;
  // 使用指南弹窗（原型 guideTitle/gStep1t/gStep1d/gStep2t/gStep2d/gStep3t/gStep3d/guideNoteTitle）
  guideTitle: string;
  gStep1t: string;
  gStep1d: string;
  gStep2t: string;
  gStep2d: string;
  gStep3t: string;
  gStep3d: string;
  guideNoteTitle: string;
  deployDnsmasq: string;
  deployHosts: string;
  deployAdguardPihole: string;
  deployUnboundBindSmartdns: string;
  close: string;
  // 规则匹配测试与路由器脚本
  ruleTesterTitle: string;
  ruleTesterDesc: string;
  ruleTesterInputPlaceholder: string;
  ruleTesterBtn: string;
  ruleTesterActionBlocked: string;
  ruleTesterActionWhitelisted: string;
  ruleTesterActionCustomDns: string;
  ruleTesterActionPassed: string;
  ruleTesterMatchedRuleLabel: string;
  ruleTesterTargetIpLabel: string;
  routerScriptTitle: string;
  routerScriptDesc: string;
  routerScriptTargetLabel: string;
  routerScriptCopyBtn: string;
  routerScriptCopied: string;
}
