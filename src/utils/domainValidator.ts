// src/utils/domainValidator.ts v3.7.59
// 域名验证与行解析：支持 9 种过滤格式的入站解析（hosts/dnsmasq/AdGuard/Pi-hole/Bind RPZ/
// SmartDNS/Unbound/纯域名/白名单），实现「粘贴任意格式 → 统一结构 → 互转」。
// 校验原语（isValidDomain/isValidIp/normalizeDomain）复用 domainPrimitives，避免重复定义；
// 统计聚合复用 statsAggregator；类型 ParseResult/ParseStats 定义在 types/formats.ts。

import { type ParseResult, type ParseStats } from '../types/formats';
import { isValidDomain, isValidIp, normalizeDomain } from './domainPrimitives';
import { buildParseStats } from './statsAggregator';

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
      originalLine: line,
    };
  }

  // AdGuard 白名单 (@@) 或自定义 DNS (@)
  if (content.startsWith('@')) {
    // AdGuard 例外规则 @@domain 与 @@||domain^$options 均等价于白名单，按 whitelist 处理避免被静默丢弃。
    // 注意：@@domain（无 || 前缀）也必须识别，原 && 条件误将其漏掉、被当成自定义 DNS 而丢弃。
    // 兼容带修饰符的规则（如 @@||domain^$important），域名取 || 与首个 ^/$/行尾之间部分。
    if (content.startsWith('@@')) {
      const hasPipe = content.startsWith('@@||');
      const afterMarker = hasPipe ? content.substring(4) : content.substring(2);
      const candidates = [afterMarker.indexOf('^'), afterMarker.indexOf('$'), afterMarker.length];
      const positives = candidates.filter((i) => i > 0);
      const endIdx = positives.length > 0 ? Math.min(...positives) : afterMarker.length;
      const domain = normalizeDomain(afterMarker.substring(0, endIdx));
      return {
        type: 'whitelist',
        domain,
        isValid: isValidDomain(domain),
        originalLine: line,
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
        originalLine: line,
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
      originalLine: line,
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
        originalLine: line,
      };
    }
    return { type: 'comment', originalLine: line };
  }

  // AdGuard 格式：||domain^ 或带修饰符 ||domain^$options
  // 取 || 之后到首个 ^ / $ / 行尾之间的部分作为域名，兼容 $important 等修饰符
  if (content.startsWith('||')) {
    const after = content.substring(2);
    const endIdx = Math.min(
      ...[after.indexOf('^'), after.indexOf('$'), after.length].filter((i) => i > 0)
    );
    const domain = normalizeDomain(after.substring(0, endIdx));
    return {
      type: 'adguard',
      domain,
      isValid: isValidDomain(domain),
      originalLine: line,
    };
  }

  // Unbound 格式：local-zone: "domain" refuse（黑名单） / transparent（白名单）
  if (content.startsWith('local-zone:')) {
    const m = content.match(
      /^local-zone:\s*"([^"]+)"\s+(refuse|transparent|always_refuse|always_transparent)\s*$/
    );
    if (m) {
      const domain = normalizeDomain(m[1]);
      const isWl = m[2].startsWith('transparent');
      return {
        type: isWl ? 'whitelist' : 'adguard',
        domain,
        isValid: isValidDomain(domain),
        originalLine: line,
      };
    }
    return { type: 'comment', originalLine: line };
  }

  // SmartDNS 格式：address /domain/#（黑名单） / server /domain/ip（黑名单） / nameserver /domain/#（白名单）
  if (
    content.startsWith('address /') ||
    content.startsWith('server /') ||
    content.startsWith('nameserver /')
  ) {
    const m = content.match(/^(?:address|server|nameserver)\s+\/([^/]+)\//);
    if (m) {
      const domain = normalizeDomain(m[1]);
      const isWl = content.startsWith('nameserver');
      return {
        type: isWl ? 'whitelist' : 'adguard',
        domain,
        isValid: isValidDomain(domain),
        originalLine: line,
      };
    }
    return { type: 'comment', originalLine: line };
  }

  // Bind RPZ 格式：domain CNAME . 或 *.domain CNAME .（黑名单，保留通配符）
  if (/\s+CNAME\s+\.\s*$/.test(content)) {
    const dom = content.split(/\s+/)[0];
    const domain = normalizeDomain(dom);
    return {
      type: 'adguard',
      domain,
      isValid: isValidDomain(domain),
      originalLine: line,
    };
  }

  // 纯域名
  const domain = normalizeDomain(content);
  return {
    type: 'domain',
    domain,
    isValid: isValidDomain(domain),
    originalLine: line,
  };
};

// 解析完整源文本：按行解析并聚合统计，支持自定义域名混排（行内 # 注释 + 空白行自动跳过）
export interface ParseSourceResult {
  entries: ParseResult[];
  stats: ParseStats;
}

export const parseSource = (text: string): ParseSourceResult => {
  const lines = text.split('\n');
  const entries: ParseResult[] = [];
  let pendingCustom = '';
  let customAccum = '';
  let pendingWhitelist = '';
  let whitelistAccum = '';

  const flushAccum = (): void => {
    if (pendingCustom) {
      const d = normalizeDomain(pendingCustom);
      entries.push({ type: 'domain', domain: d, isValid: isValidDomain(d), originalLine: customAccum });
      pendingCustom = '';
      customAccum = '';
    }
    if (pendingWhitelist) {
      const d = normalizeDomain(pendingWhitelist);
      entries.push({ type: 'whitelist', domain: d, isValid: isValidDomain(d), originalLine: whitelistAccum });
      pendingWhitelist = '';
      whitelistAccum = '';
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const hashIndex = trimmed.indexOf('#');
    const isEmpty = !trimmed;
    const isComment = hashIndex === 0 || (hashIndex < 0 && trimmed.startsWith('!'));
    const content = hashIndex >= 0 ? trimmed.substring(0, hashIndex).trim() : trimmed;

    if (isEmpty || isComment || !content) {
      flushAccum();
      entries.push(parseDomainLine(line));
      continue;
    }

    // 自定义域名混排：以 @ 开头且独占一行，下一行正式域名时合并为自定义解析
    if (content.startsWith('@') && !content.includes('=')) {
      pendingCustom = content.slice(1).trim();
      customAccum = line;
      continue;
    }
    if (pendingCustom) {
      const domain = normalizeDomain(content);
      if (isValidDomain(domain) && !content.startsWith('@') && !content.startsWith('+')) {
        entries.push({ type: 'domain', domain, isValid: true, originalLine: `${customAccum}\n${line}` });
        pendingCustom = '';
        customAccum = '';
        continue;
      }
      flushAccum();
    }

    // 白名单混排：以 + 开头且独占一行，下一行域名时合并为白名单
    if (content.startsWith('+')) {
      pendingWhitelist = content.slice(1).trim();
      whitelistAccum = line;
      continue;
    }
    if (pendingWhitelist) {
      const domain = normalizeDomain(content);
      if (isValidDomain(domain) && !content.startsWith('@') && !content.startsWith('+')) {
        entries.push({ type: 'whitelist', domain, isValid: true, originalLine: `${whitelistAccum}\n${line}` });
        pendingWhitelist = '';
        whitelistAccum = '';
        continue;
      }
      flushAccum();
    }

    entries.push(parseDomainLine(line));
  }
  flushAccum();

  return { entries, stats: buildParseStats(entries) };
};

// 重新导出校验原语与类型，保持对 parser.ts / sortDedupe.ts 等调用方的公开 API 兼容
export { isValidDomain, isValidIp, normalizeDomain };
export type { ParseResult, ParseStats };
