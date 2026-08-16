// src/utils/domainValidator.ts v3.7.24
// 域名验证与行解析工具函数

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
  // 解析失败/格式无效的行数（如非法白名单、非法 customDns、非法域名），
  // 与真实注释/空行分开统计，避免 stats 数字失真
  invalidCount: number;
}

// 验证域名格式
export const isValidDomain = (domain: string): boolean => {
  return DOMAIN_REGEX.test(domain);
};

// IP 地址校验（IPv4 / IPv6）
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;

export const isValidIp = (ip: string): boolean => {
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
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

  // AdGuard 白名单 (@@) 或自定义 DNS (@)
  if (content.startsWith('@')) {
    // AdGuard 例外规则 @@||domain^ 等价于白名单，按 whitelist 处理避免被静默丢弃
    if (content.startsWith('@@') && content.startsWith('@@||') && content.endsWith('^')) {
      const domain = normalizeDomain(content.substring(4, content.length - 1));
      return {
        type: 'whitelist',
        domain,
        isValid: isValidDomain(domain),
        originalLine: line
      };
    }
    const match = content.substring(1).trim().match(/^([^=]+)=(.+)$/);
    if (match) {
      const domain = normalizeDomain(match[1]);
      const ip = match[2].trim();
      return {
        type: 'customDns',
        domain,
        ip,
        isValid: isValidDomain(domain) && isValidIp(ip),
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

