// src/utils/parseDomainFormats.ts v3.7.58
// 各过滤格式的入站行解析器：hosts / dnsmasq / AdGuard / Unbound / SmartDNS / Bind RPZ /
// 白名单 / 自定义 DNS / 纯域名。
// 每个解析器接收已去除行内 # 注释的 content 与原始行，命中返回 ParseResult 子集，否则返回 null。

import {
  normalizeDomain,
  isValidDomain,
  isValidIp,
  type ParseResult,
} from './domainPrimitives';

type PartialParse = Omit<ParseResult, 'originalLine'>;

// 计算 AdGuard/白名单规则中域名的截止位置：取首个 ^ / $ / 行尾之间的最小下标
const domainEndIndex = (afterMarker: string): number => {
  const candidates = [afterMarker.indexOf('^'), afterMarker.indexOf('$'), afterMarker.length];
  const positives = candidates.filter((i) => i > 0);
  return positives.length > 0 ? Math.min(...positives) : afterMarker.length;
};

// 白名单 (+) 与自定义 DNS (@)
export const parseAtRule = (content: string, originalLine: string): PartialParse | null => {
  // 白名单 (+)
  if (content.startsWith('+')) {
    const domain = normalizeDomain(content.substring(1).trim());
    return {
      type: 'whitelist',
      domain,
      isValid: isValidDomain(domain),
      originalLine,
    };
  }

  // AdGuard 白名单 (@@) —— 兼容 @@domain 与 @@||domain^$options 两种写法。
  // 注意：@@domain（无 || 前缀）也必须识别，避免被当成自定义 DNS 而静默丢弃。
  if (content.startsWith('@@')) {
    const hasPipe = content.startsWith('@@||');
    const afterMarker = hasPipe ? content.substring(4) : content.substring(2);
    const endIdx = domainEndIndex(afterMarker);
    const domain = normalizeDomain(afterMarker.substring(0, endIdx));
    return {
      type: 'whitelist',
      domain,
      isValid: isValidDomain(domain),
      originalLine,
    };
  }

  // 自定义 DNS (@domain=ip)
  const match = content.substring(1).trim().match(/^([^=]+)=(.+)$/);
  if (match) {
    const domain = normalizeDomain(match[1]);
    const ip = match[2].trim();
    return {
      type: 'customDns',
      domain,
      ip,
      isValid: isValidDomain(domain) && isValidIp(ip),
      originalLine,
    };
  }
  return null;
};

// Hosts 格式（0.0.0.0 / 127.0.0.1 前缀）
export const parseHosts = (content: string, originalLine: string): PartialParse | null => {
  if (content.startsWith('0.0.0.0 ') || content.startsWith('127.0.0.1 ')) {
    const domain = normalizeDomain(content.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, ''));
    return {
      type: 'hosts',
      domain,
      isValid: isValidDomain(domain),
      originalLine,
    };
  }
  return null;
};

// Dnsmasq 格式（address=/domain/ip）
export const parseDnsmasq = (content: string, originalLine: string): PartialParse | null => {
  if (!content.startsWith('address=/')) {
    return null;
  }
  const match = content.match(/address=\/([^\/]+)\//);
  if (!match) {
    return { type: 'comment', originalLine };
  }
  const domain = normalizeDomain(match[1]);
  return {
    type: 'dnsmasq',
    domain,
    isValid: isValidDomain(domain),
    originalLine,
  };
};

// AdGuard 黑名单格式（||domain^ 或带修饰符 ||domain^$options）
export const parseAdGuard = (content: string, originalLine: string): PartialParse | null => {
  if (!content.startsWith('||')) {
    return null;
  }
  const after = content.substring(2);
  const endIdx = domainEndIndex(after);
  const domain = normalizeDomain(after.substring(0, endIdx));
  return {
    type: 'adguard',
    domain,
    isValid: isValidDomain(domain),
    originalLine,
  };
};

// Unbound 格式（local-zone: "domain" refuse / transparent）
export const parseUnbound = (content: string, originalLine: string): PartialParse | null => {
  if (!content.startsWith('local-zone:')) {
    return null;
  }
  const m = content.match(
    /^local-zone:\s*"([^"]+)"\s+(refuse|transparent|always_refuse|always_transparent)\s*$/
  );
  if (!m) {
    return { type: 'comment', originalLine };
  }
  const domain = normalizeDomain(m[1]);
  const isWl = m[2].startsWith('transparent');
  return {
    type: isWl ? 'whitelist' : 'adguard',
    domain,
    isValid: isValidDomain(domain),
    originalLine,
  };
};

// SmartDNS 格式（address /domain/# 黑名单，server /domain/ip 黑名单，nameserver /domain/# 白名单）
export const parseSmartDns = (content: string, originalLine: string): PartialParse | null => {
  if (
    !content.startsWith('address /') &&
    !content.startsWith('server /') &&
    !content.startsWith('nameserver /')
  ) {
    return null;
  }
  const m = content.match(/^(?:address|server|nameserver)\s+\/([^/]+)\//);
  if (!m) {
    return { type: 'comment', originalLine };
  }
  const domain = normalizeDomain(m[1]);
  const isWl = content.startsWith('nameserver');
  return {
    type: isWl ? 'whitelist' : 'adguard',
    domain,
    isValid: isValidDomain(domain),
    originalLine,
  };
};

// Bind RPZ 格式（domain CNAME . 或 *.domain CNAME .，保留通配符）
export const parseRpx = (content: string, originalLine: string): PartialParse | null => {
  if (!/\s+CNAME\s+\.\s*$/.test(content)) {
    return null;
  }
  const domain = normalizeDomain(content.split(/\s+/)[0]);
  return {
    type: 'adguard',
    domain,
    isValid: isValidDomain(domain),
    originalLine,
  };
};

// 纯域名
export const parsePlainDomain = (content: string, originalLine: string): PartialParse => {
  const domain = normalizeDomain(content);
  return {
    type: 'domain',
    domain,
    isValid: isValidDomain(domain),
    originalLine,
  };
};
