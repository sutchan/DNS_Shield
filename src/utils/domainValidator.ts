// src/utils/domainValidator.ts v3.2.0
// 域名验证与行解析工具函数

import { CustomDnsEntry, ParsedData } from '../types';

// 域名正则表达式
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export interface ParseResult {
  type: 'empty' | 'comment' | 'whitelist' | 'customDns' | 'hosts' | 'dnsmasq' | 'adguard' | 'domain';
  domain?: string;
  ip?: string;
  isValid?: boolean;
  originalLine: string;
}

export interface ParseStats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
}

// 验证域名格式
export const isValidDomain = (domain: string): boolean => {
  return DOMAIN_REGEX.test(domain);
};

// 规范化域名（去除通配符前缀并转为小写）
export const normalizeDomain = (domain: string): string => {
  return domain.toLowerCase().replace(/^\*\./, '');
};

// 解析单行域名
export const parseDomainLine = (line: string): ParseResult => {
  const trimmed = line.trim();

  if (!trimmed) {
    return { type: 'empty', originalLine: line };
  }

  const hashIndex = trimmed.indexOf('#');
  if (hashIndex === 0) {
    return { type: 'comment', originalLine: line };
  }

  let content = hashIndex >= 0 ? trimmed.substring(0, hashIndex).trim() : trimmed;

  if (!content) {
    return { type: 'comment', originalLine: line };
  }

  if (content.startsWith('!')) {
    return { type: 'comment', originalLine: line };
  }

  // 白名单 (+)
  if (content.startsWith('+')) {
    const domain = normalizeDomain(content.substring(1).trim());
    const isValidResult = isValidDomain(domain);
    return {
      type: 'whitelist',
      domain,
      isValid: isValidResult,
      originalLine: line
    };
  }

  // 自定义 DNS (@)
  if (content.startsWith('@')) {
    const match = content.substring(1).trim().match(/^([^=]+)=(.+)$/);
    if (match) {
      const domain = normalizeDomain(match[1]);
      const ip = match[2].trim();
      return {
        type: 'customDns',
        domain,
        ip,
        isValid: isValidDomain(domain),
        originalLine: line
      };
    }
    return { type: 'comment', originalLine: line };
  }

  // Hosts 格式
  if (content.startsWith('0.0.0.0 ') || content.startsWith('127.0.0.1 ')) {
    const domain = normalizeDomain(content.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, ''));
    return {
      type: 'hosts',
      domain,
      isValid: isValidDomain(domain),
      originalLine: line
    };
  }

  // Dnsmasq 格式
  if (content.startsWith('address=/')) {
    const match = content.match(/address=\/([^\/]+)\//);
    if (match) {
      const domain = normalizeDomain(match[1]);
      return {
        type: 'dnsmasq',
        domain,
        isValid: isValidDomain(domain),
        originalLine: line
      };
    }
    return { type: 'comment', originalLine: line };
  }

  // AdGuard 格式
  if (content.startsWith('||') && content.endsWith('^')) {
    const domain = normalizeDomain(content.substring(2, content.length - 1));
    return {
      type: 'adguard',
      domain,
      isValid: isValidDomain(domain),
      originalLine: line
    };
  }

  // 纯域名
  const domain = normalizeDomain(content);
  return {
    type: 'domain',
    domain,
    isValid: isValidDomain(domain),
    originalLine: line
  };
};
