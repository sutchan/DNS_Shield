// src/utils/rulesGenerator.ts v3.12.0
// 规则生成核心：将解析后的域名数据转换为 Dnsmasq / Hosts / AdGuard / 白名单 /
// Unbound / Pi-hole / 纯域名 / Bind RPZ / SmartDNS 12 种格式。纯函数、可单测。
// 头部注释配置（HEADER_CONFIGS）已拆分至 headerConfigs.ts。
import { CustomDnsEntry, Settings, OutputContent, Translation, FormatType, ParsedData, Stats, RegexRule } from '../types';
import { HEADER_CONFIGS } from './headerConfigs';
import { buildBlockedRules, buildCustomDnsRules, buildWhitelistRules, buildRegexRules, buildHeaders, mergeContents } from './formatGenerators';

// 生成头部
export const generateHeader = (
  formatType: FormatType,
  totalDomains: number,
  whitelistCount: number,
  dateStr: string,
  settings: Settings,
  t: Translation
): string => {
  // 通过 i18n 键路径取值（支持 header.* 与 whitelist.*）
  const resolve = (path: string): string => {
    const [group, key] = path.split('.');
    const obj = (t as unknown as Record<string, Record<string, string>>)[group];
    return obj?.[key] ?? '';
  };

  const cfg = HEADER_CONFIGS[formatType];
  if (!cfg) return '';

  const commentChar = cfg.commentChar;
  const separator = cfg.separator;
  const title = resolve(cfg.title);
  const description = resolve(cfg.description);
  // 顶层 format 的用法说明聚合了 merlin/openwrt 等；其它格式按 cfg.usage 路径解析；
  // 注意 cfg.usage 存的是 i18n 键路径（如 'header.hostsUsage'），必须经 resolve 取值，
  // 否则会在导出头部出现字面量 "header.hostsUsage" 而非真实用法说明。
  const extraUsage =
    formatType === 'dnsmasq'
      ? `${t.header.usage}\n${t.header.merlinUsage}\n${t.header.openwrtUsage}`
      : cfg.usage
      ? resolve(cfg.usage)
      : '';

  const lines: string[] = [];
  // 紧凑头部：保留 i18n 信息（title/description/usage/project/demo），
  // 对齐 prototype.html 的精简风格——去除冗余分隔线与空行。
  lines.push(`${commentChar} ${separator}`);
  lines.push(`${commentChar} ${settings.projectName} - ${title}`);
  lines.push(`${commentChar} ${description}`);
  lines.push(`${commentChar} ${t.header.version}: ${settings.version}  ${t.header.update}: ${dateStr}`);
  lines.push(`${commentChar} ${t.header.domains}: ${totalDomains} ${t.header.uniqueDomains}`);
  if (whitelistCount > 0) {
    lines.push(`${commentChar} ${t.header.whitelist}: ${whitelistCount} ${t.header.domainsCount}`);
  }
  if (extraUsage) {
    lines.push(extraUsage);
  }
  lines.push(`${commentChar} ${t.header.project} https://github.com/sutchan/DNS_Shield`);
  lines.push(`${commentChar} ${t.header.demo} https://dns.ewuse.com/`);

  return lines.join('\n') + '\n\n';
};

// 公共变换：去通配 + 去重 + 白名单剔除。generateRules（导出头部计数）与
// computeEffectiveStats（UI 统计面板）共用，确保两处口径永不漂移（T-P2-07）。
// 口径约定：blockedDomains = 实际拦截域名（黑名单剔除白名单）+ 自定义 DNS；
// 统计面板的「有效规则数」另含白名单豁免，属不同指标，不得与前者混用。
export const prepareRuleData = (
  domains: string[],
  whitelist: string[],
  customDns: CustomDnsEntry[],
  settings: Settings
): { filteredWhitelist: string[]; blockedDomains: string[]; customDns: CustomDnsEntry[] } => {
  const { dedupDomains, removeWildcard } = settings;

  let filteredDomains = [...domains];
  if (removeWildcard) {
    filteredDomains = filteredDomains.map((d) => d.replace(/^\*\./, ''));
  }
  if (dedupDomains) {
    filteredDomains = [...new Set(filteredDomains)].sort();
  }

  let filteredWhitelist = [...whitelist];
  if (removeWildcard) {
    filteredWhitelist = filteredWhitelist.map((d) => d.replace(/^\*\./, ''));
  }
  if (dedupDomains) {
    filteredWhitelist = [...new Set(filteredWhitelist)].sort();
  }

  // 黑名单生成时必须剔除白名单域名：dnsmasq 的 address=/domain/IP 黑洞规则
  // 无法被后续 server=/domain/ 可靠覆盖，hosts 也无白名单语义，因此直接从拦截
  // 列表中排除白名单域名，使白名单在 dnsmasq/hosts 格式下真正生效（而非仅注释）。
  const whitelistSet = new Set(filteredWhitelist);
  const blockedDomains = filteredDomains.filter((domain) => !whitelistSet.has(domain));

  return { filteredWhitelist, blockedDomains, customDns };
};

// 生成规则：编排解析后的数据经过格式拼接（已拆分至 formatGenerators.ts）
export const generateRules = (
  domains: string[],
  whitelist: string[],
  customDns: CustomDnsEntry[],
  settings: Settings,
  t: Translation,
  regexRules: RegexRule[] = []
): OutputContent => {
  const { addHeader } = settings;

  const { filteredWhitelist, blockedDomains } = prepareRuleData(domains, whitelist, customDns, settings);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const totalDomains = blockedDomains.length + customDns.length;
  const whitelistCount = filteredWhitelist.length;

  const contents = mergeContents(
    buildHeaders(totalDomains, whitelistCount, dateStr, settings, t),
    buildBlockedRules(blockedDomains, settings),
    buildCustomDnsRules(customDns),
    buildRegexRules(regexRules),
    buildWhitelistRules(filteredWhitelist, settings, t, addHeader)
  );

  return contents;
};

// 计算「生效后的实际统计」：与 generateRules 采用完全一致的变换
// （removeWildcard 去通配、dedupDomains 去重、白名单从黑名单剔除），
// 使 UI 展示的计数与最终导出结果保持一致，修复统计数字与实际生成不符的问题。
// 返回部分 Stats 字段，由调用方合并到原 stats（domainCount/commentCount/invalidCount
// 属于输入行结构统计，不随这两个开关变化，故保留原始值）。
export const computeEffectiveStats = (
  parsedData: ParsedData,
  settings: Settings
): Pick<Stats, 'blacklistCount' | 'whitelistCount' | 'validCount'> => {
  // 与 generateRules 共用同一变换，保证统计面板与导出头部口径永不漂移（T-P2-07）
  const { filteredWhitelist, blockedDomains, customDns } = prepareRuleData(
    parsedData.domains,
    parsedData.whitelist,
    parsedData.customDns,
    settings
  );

  // 有效规则数 = 黑名单(已剔除白名单) + 白名单豁免 + 自定义 DNS。
  // 白名单域名若同时出现在黑名单中只计一次，故用并集去重，避免重复计数。
  const uniqueValidDomains = new Set([...blockedDomains, ...filteredWhitelist]);
  return {
    blacklistCount: blockedDomains.length + customDns.length,
    whitelistCount: filteredWhitelist.length,
    validCount: uniqueValidDomains.size + customDns.length
  };
};
