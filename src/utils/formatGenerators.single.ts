// src/utils/formatGenerators.single.ts v3.13.1
// 单格式规则生成：与 formatGenerators.ts 的全量生成语义 1:1 对齐，
// 但只拼接目标格式的字符串，避免超大输入（10 万行 × 12 格式）下生成其余 11 种
// 格式的冗余字符串开销（T-P1-06：runGenerate 按当前格式惰性生成）。
// 一致性由 formatGenerators.single.test.ts 逐格式断言保证，改动须同步两侧。
import type { Settings, CustomDnsEntry, Translation, RegexRule, FormatType } from '../types';
import { prepareRuleData, generateHeader } from './rulesGenerator';
import { toAdGuardRegex, toPiHoleRegex } from './regexRules';

/** 黑名单域名在指定格式下的单行规则（与 buildBlockedRules 逐格式一致） */
function blockedRuleLine(format: FormatType, domain: string, settings: Settings): string {
  switch (format) {
    case 'dnsmasq':
      return `address=/${domain}/${settings.ipv4}\n`;
    case 'hosts':
      return `${settings.ipv4} ${domain}\n`;
    case 'adguard':
      return `||${domain}^\n`;
    case 'unbound':
      // refuse 同时拒绝 A 与 AAAA（协议无关），无需单独处理 IPv6
      return `local-zone: "${domain}" refuse\n`;
    case 'pihole':
      return `0.0.0.0 ${domain}\n`;
    case 'domains':
      return `${domain}\n`;
    case 'bind':
      return `${domain} CNAME .\n*.${domain} CNAME .\n`;
    case 'smartdns':
      return `address /${domain}/#\n`;
    case 'mosdns':
      return `domain:${domain}\n`;
    case 'clash':
      return `DOMAIN-SUFFIX,${domain},reject\n`;
    case 'coredns':
      return `0.0.0.0 ${domain}\n`;
    case 'whitelist':
      return '';
  }
}

/** 黑名单域名的 IPv6 附加行（仅 dnsmasq/hosts/coredns，与 buildBlockedRules 一致） */
function blockedIPv6Line(format: FormatType, domain: string, settings: Settings): string {
  switch (format) {
    case 'dnsmasq':
      return `address=/${domain}/${settings.ipv6}\n`;
    case 'hosts':
      return `${settings.ipv6} ${domain}\n`;
    case 'coredns':
      return `${settings.ipv6} ${domain}\n`;
    default:
      return '';
  }
}

/** 自定义 DNS 在指定格式下的单行规则（与 buildCustomDnsRules 一致） */
function customDnsRuleLine(format: FormatType, item: CustomDnsEntry): string {
  switch (format) {
    case 'dnsmasq':
      return `address=/${item.domain}/${item.ip}\n`;
    case 'hosts':
      return `${item.ip} ${item.domain}\n`;
    case 'adguard':
      return `||${item.domain}^\n`;
    case 'pihole':
      return `${item.ip} ${item.domain}\n`;
    case 'smartdns':
      return `server /${item.domain}/${item.ip}\n`;
    case 'coredns':
      return `${item.ip} ${item.domain}\n`;
    default:
      return '';
  }
}

/** 白名单段标题注释（仅 addHeader 为真时生成，与 buildWhitelistRules 一致） */
function whitelistHeader(format: FormatType, settings: Settings, t: Translation): string {
  switch (format) {
    case 'dnsmasq':
      return `\n# ${t.whitelist.title}\n`;
    case 'hosts':
      // hosts 原生不支持白名单语法：注明限制，逐行列出已排除的域名供参考
      return `\n# ${t.whitelist.title}\n# ${t.whitelist.hostsNote ?? ''}\n`;
    case 'adguard':
      return settings.adguardIncludeWhitelist ? `\n! ${t.whitelist.title}\n` : '';
    case 'whitelist':
      return `# ${t.whitelist.title}\n`;
    case 'pihole':
    case 'bind':
      // Pi-hole / Bind RPZ 原生不支持白名单语法：与 buildWhitelistRules 一致，不输出段标题
      return '';
    default:
      // unbound / domains / smartdns / mosdns / clash / coredns
      return `\n# ${t.whitelist.title}\n`;
  }
}

/** 白名单域名在指定格式下的规则行（与 buildWhitelistRules 逐格式一致） */
function whitelistRuleLines(format: FormatType, domain: string, settings: Settings, t: Translation): string {
  switch (format) {
    case 'dnsmasq':
      return `server=/${domain}/\n`;
    case 'hosts':
      return `# ${t.whitelist.label} ${domain}\n`;
    case 'adguard':
      // 关闭开关时仅生成拦截规则，保留纯黑名单语义
      return settings.adguardIncludeWhitelist ? `@@||${domain}^\n` : '';
    case 'whitelist':
      return `@@||${domain}^\n`;
    case 'unbound':
      return `local-zone: "${domain}" transparent\n`;
    case 'domains':
      return `# ${t.whitelist.label} ${domain}\n`;
    case 'smartdns':
      return `# ${t.whitelist.label} ${domain}\n`;
    case 'mosdns':
      return `# ${t.whitelist.label} ${domain}\n`;
    case 'clash':
      return `DOMAIN-SUFFIX,${domain},DIRECT\n`;
    case 'coredns':
      return `# ${t.whitelist.label} ${domain}\n`;
    default:
      return '';
  }
}

/** 正则规则在指定格式下的输出（与 buildRegexRules 一致：仅 adguard/pihole） */
function regexRuleLines(format: FormatType, rule: RegexRule): string {
  if (format === 'adguard') {
    return toAdGuardRegex(rule.pattern, rule.isException) + '\n';
  }
  if (format === 'pihole') {
    // 例外语义 Pi-hole FTL 不支持，降级为注释
    return (rule.isException ? '# ' : '') + toPiHoleRegex(rule.pattern) + '\n';
  }
  return '';
}

/**
 * 仅生成指定格式的规则文本（供预览 / 下载 / 复用的惰性路径）。
 * 与 generateRules 的拼接顺序完全一致：头部 → 黑名单 → 自定义 DNS → 正则 → 白名单。
 */
export function generateSingleFormat(
  format: FormatType,
  domains: string[],
  whitelist: string[],
  customDns: CustomDnsEntry[],
  settings: Settings,
  t: Translation,
  regexRules: RegexRule[] = []
): string {
  // 与 generateRules / computeEffectiveStats 共用同一变换，保证口径一致（T-P2-07）
  const { filteredWhitelist, blockedDomains, customDns: filteredCustomDns } = prepareRuleData(
    domains,
    whitelist,
    customDns,
    settings
  );

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const totalDomains = blockedDomains.length + filteredCustomDns.length;
  const whitelistCount = filteredWhitelist.length;

  let out = '';
  // 与 formatGenerators.buildHeaders 一致：whitelist 是纯白名单文件，不生成全局头部
  // （其余 11 种格式在 addHeader 为真时带头部）。
  if (settings.addHeader && format !== 'whitelist') {
    out += generateHeader(format, totalDomains, whitelistCount, dateStr, settings, t);
  }

  blockedDomains.forEach((domain) => {
    out += blockedRuleLine(format, domain, settings);
    if (settings.blockIPv6) {
      out += blockedIPv6Line(format, domain, settings);
    }
  });

  filteredCustomDns.forEach((item) => {
    out += customDnsRuleLine(format, item);
  });

  if (regexRules.length > 0) {
    regexRules.forEach((rule) => {
      out += regexRuleLines(format, rule);
    });
  }

  if (filteredWhitelist.length > 0) {
    if (settings.addHeader) {
      out += whitelistHeader(format, settings, t);
    }
    filteredWhitelist.forEach((domain) => {
      out += whitelistRuleLines(format, domain, settings, t);
    });
  }

  return out;
}
