// src/utils/formatGenerators.ts v3.7.50
// 9 种输出格式的单行规则拼接逻辑，从 rulesGenerator.ts 拆分以保持生成器主文件聚焦编排。
// 每个 helper 返回 OutputContent（9 个格式字段），调用方按阶段累加。
import type { Settings, CustomDnsEntry, OutputContent, Translation } from '../types';
import { generateHeader } from './rulesGenerator';

type Contents = OutputContent;

function emptyContents(): Contents {
  return {
    dnsmasq: '', hosts: '', adguard: '', whitelist: '',
    unbound: '', pihole: '', domains: '', bind: '', smartdns: '',
  };
}

/** 黑名单域名的 9 格式规则（含可选 IPv6 黑洞） */
export function buildBlockedRules(
  blockedDomains: string[],
  settings: Settings
): Contents {
  const out = emptyContents();
  blockedDomains.forEach((domain) => {
    out.dnsmasq += `address=/${domain}/${settings.ipv4}\n`;
    out.hosts += `${settings.ipv4} ${domain}\n`;
    out.adguard += `||${domain}^\n`;
    // Unbound: refuse 同时拒绝 A 与 AAAA（协议无关），无需单独处理 IPv6。
    out.unbound += `local-zone: "${domain}" refuse\n`;
    // Pi-hole (gravity 兼容格式)：0.0.0.0 domain
    out.pihole += `0.0.0.0 ${domain}\n`;
    // 纯域名列表
    out.domains += `${domain}\n`;
    // Bind RPZ：将域名与其子域均 CNAME 到根（.）实现拦截
    out.bind += `${domain} CNAME .\n`;
    out.bind += `*.${domain} CNAME .\n`;
    // SmartDNS：address /domain/# 返回空地址（等效拦截）
    out.smartdns += `address /${domain}/#\n`;
    if (settings.blockIPv6) {
      out.dnsmasq += `address=/${domain}/${settings.ipv6}\n`;
      out.hosts += `${settings.ipv6} ${domain}\n`;
    }
  });
  return out;
}

/** 自定义 DNS 的 9 格式规则（dnsmasq/hosts/adguard/pihole/smartdns 生效） */
export function buildCustomDnsRules(
  customDns: CustomDnsEntry[],
  settings: Settings
): Contents {
  const out = emptyContents();
  customDns.forEach((item) => {
    out.dnsmasq += `address=/${item.domain}/${item.ip}\n`;
    out.hosts += `${item.ip} ${item.domain}\n`;
    out.adguard += `||${item.domain}^\n`;
    // Pi-hole 自定义解析：ip domain
    out.pihole += `${item.ip} ${item.domain}\n`;
    // SmartDNS 自定义上游：server /domain/ip
    out.smartdns += `server /${item.domain}/${item.ip}\n`;
  });
  return out;
}

/** 白名单域名的 9 格式规则；addHeader 为真时附带白名单段标题注释 */
export function buildWhitelistRules(
  filteredWhitelist: string[],
  settings: Settings,
  t: Translation,
  addHeader: boolean
): Contents {
  const out = emptyContents();
  if (filteredWhitelist.length === 0) return out;
  if (addHeader) {
    out.dnsmasq += `\n# ${t.whitelist.title}\n`;
    // hosts 原生不支持白名单语法：注明限制，但逐行列出已排除的域名供参考
    out.hosts += `\n# ${t.whitelist.title}\n`;
    out.hosts += `# ${t.whitelist.hostsNote ?? ''}\n`;
    if (settings.adguardIncludeWhitelist) {
      out.adguard += `\n! ${t.whitelist.title}\n`;
    }
    out.whitelist += `# ${t.whitelist.title}\n`;
    out.unbound += `\n# ${t.whitelist.title}\n`;
    out.domains += `\n# ${t.whitelist.title}\n`;
    out.smartdns += `\n# ${t.whitelist.title}\n`;
  }
  filteredWhitelist.forEach((domain) => {
    out.dnsmasq += `server=/${domain}/\n`;
    out.hosts += `# ${t.whitelist.label} ${domain}\n`;
    // ADGuard 黑名单是否附带白名单豁免规则由开关控制：关闭时仅生成拦截规则，
    // 保留纯黑名单语义（白名单仍可在独立“ADGuard 白名单”清单中单独导出）。
    if (settings.adguardIncludeWhitelist) {
      out.adguard += `@@||${domain}^\n`;
    }
    out.whitelist += `@@||${domain}^\n`;
    // Unbound 白名单：transparent 恢复常规解析
    out.unbound += `local-zone: "${domain}" transparent\n`;
    // 纯域名与 RPZ 列表无白名单语义：仅以注释形式标注已豁免
    out.domains += `# ${t.whitelist.label} ${domain}\n`;
    out.smartdns += `# ${t.whitelist.label} ${domain}\n`;
  });
  return out;
}

/** 各格式头部注释（addHeader 为真时生成） */
export function buildHeaders(
  totalDomains: number,
  whitelistCount: number,
  dateStr: string,
  settings: Settings,
  t: Translation
): Contents {
  const out = emptyContents();
  if (!settings.addHeader) return out;
  out.dnsmasq = generateHeader('dnsmasq', totalDomains, whitelistCount, dateStr, settings, t);
  out.hosts = generateHeader('hosts', totalDomains, whitelistCount, dateStr, settings, t);
  out.adguard = generateHeader('adguard', totalDomains, whitelistCount, dateStr, settings, t);
  out.unbound = generateHeader('unbound', totalDomains, whitelistCount, dateStr, settings, t);
  out.pihole = generateHeader('pihole', totalDomains, whitelistCount, dateStr, settings, t);
  out.domains = generateHeader('domains', totalDomains, whitelistCount, dateStr, settings, t);
  out.bind = generateHeader('bind', totalDomains, whitelistCount, dateStr, settings, t);
  out.smartdns = generateHeader('smartdns', totalDomains, whitelistCount, dateStr, settings, t);
  return out;
}

/** 合并多个 Contents（字符串拼接） */
export function mergeContents(...parts: Contents[]): Contents {
  const acc = emptyContents();
  for (const p of parts) {
    (Object.keys(acc) as (keyof Contents)[]).forEach((k) => {
      acc[k] += p[k];
    });
  }
  return acc;
}
