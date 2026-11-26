// src/utils/ruleLines.ts v3.22.4
// 框架无关的规则行单一实现（T-AUD-M15）：运行时惰性生成器与构建期产物生成器共用。
// 仅覆盖「黑名单 / 自定义 DNS」这两类两侧语义完全一致的行；白名单因发布产物
// 兼容历史格式（pihole/bind 等带注释）仍由各侧保留适配层，避免改变既有产物字节。
import type { FormatType } from '../types';

export interface RuleLineSettings {
  ipv4: string;
  ipv6: string;
  blockIPv6: boolean;
}

/** 黑名单域名在指定格式下的规则行（含可选 IPv6；每行以 \n 结尾） */
export function blockedRuleLines(
  format: FormatType,
  domain: string,
  settings: RuleLineSettings
): string {
  switch (format) {
    case 'dnsmasq':
      return `address=/${domain}/${settings.ipv4}\n`
        + (settings.blockIPv6 ? `address=/${domain}/${settings.ipv6}\n` : '');
    case 'hosts':
      return `${settings.ipv4} ${domain}\n`
        + (settings.blockIPv6 ? `${settings.ipv6} ${domain}\n` : '');
    case 'adguard':
      return `||${domain}^\n`;
    case 'unbound':
      // refuse 同时拒绝 A 与 AAAA，无需单独 IPv6 行
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
      return `0.0.0.0 ${domain}\n`
        + (settings.blockIPv6 ? `${settings.ipv6} ${domain}\n` : '');
    case 'whitelist':
      return '';
  }
}

/** 自定义 DNS 在指定格式下的规则行（无对应语法的格式返回空串） */
export function customDnsRuleLine(format: FormatType, domain: string, ip: string): string {
  switch (format) {
    case 'dnsmasq':
      return `address=/${domain}/${ip}\n`;
    case 'hosts':
      return `${ip} ${domain}\n`;
    case 'adguard':
      return `||${domain}^\n`;
    case 'pihole':
      return `${ip} ${domain}\n`;
    case 'smartdns':
      return `server /${domain}/${ip}\n`;
    case 'coredns':
      return `${ip} ${domain}\n`;
    default:
      return '';
  }
}
