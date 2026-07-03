// src/utils/parser.ts v3.2.0
import { CustomDnsEntry, ParsedData } from '../types';
import { parseDomainLine, ParseStats, isValidDomain, normalizeDomain } from './domainValidator';

// 解析源文本
export const parseSource = (text: string): { data: ParsedData; stats: ParseStats } => {
  const lines = text.split('\n');

  const domains: string[] = [];
  const whitelist: string[] = [];
  const customDns: CustomDnsEntry[] = [];
  let commentCount = 0;

  for (const line of lines) {
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      commentCount++;
      continue;
    }

    if (parsed.type === 'comment') {
      commentCount++;
      continue;
    }

    if (parsed.type === 'whitelist') {
      if (parsed.isValid && parsed.domain) {
        whitelist.push(parsed.domain);
      } else {
        commentCount++;
      }
      continue;
    }

    if (parsed.type === 'customDns') {
      if (parsed.isValid && parsed.domain && parsed.ip) {
        customDns.push({ domain: parsed.domain, ip: parsed.ip });
      } else {
        commentCount++;
      }
      continue;
    }

    if (parsed.type === 'hosts' || parsed.type === 'dnsmasq' || parsed.type === 'adguard' || parsed.type === 'domain') {
      if (parsed.isValid && parsed.domain) {
        domains.push(parsed.domain);
      } else {
        commentCount++;
      }
      continue;
    }

    commentCount++;
  }

  // 去重和处理冲突
  const whitelistSet = new Set(whitelist.map(w => w.replace(/^\*\./, '')));
  const customDnsSet = new Set(customDns.map(c => c.domain.replace(/^\*\./, '')));
  const excludeSet = new Set([...whitelistSet, ...customDnsSet]);

  const filteredDomains = domains.filter(d => !excludeSet.has(d.replace(/^\*\./, '')));
  const uniqueWhitelist = [...new Set(whitelist)];

  const stats: ParseStats = {
    domainCount: filteredDomains.length,
    validCount: filteredDomains.length + uniqueWhitelist.length,
    commentCount,
    blacklistCount: filteredDomains.length,
    whitelistCount: uniqueWhitelist.length
  };

  return {
    data: {
      domains: filteredDomains,
      whitelist: uniqueWhitelist,
      customDns
    },
    stats
  };
};

// 排序域名
export const sortDomains = (sourceInput: string): string => {
  const lines = sourceInput.split('\n');

  const headerComments: string[] = [];
  const bodyLines: string[] = [];
  const specialLines: string[] = [];

  let inHeader = true;

  for (const line of lines) {
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      bodyLines.push(line);
      continue;
    }

    if (parsed.type === 'whitelist' || parsed.type === 'customDns') {
      specialLines.push(line);
      continue;
    }

    if (parsed.type === 'comment') {
      if (inHeader) {
        headerComments.push(line);
      } else {
        bodyLines.push(line);
      }
      continue;
    }

    inHeader = false;
    bodyLines.push(line);
  }

  const plainDomains = bodyLines.filter(line => {
    const p = parseDomainLine(line);
    return p.type === 'domain' || p.type === 'hosts' || p.type === 'dnsmasq';
  });

  const comments = bodyLines.filter(line => {
    const p = parseDomainLine(line);
    return p.type === 'comment';
  });

  const sortedDomains = [...plainDomains].sort((a, b) => {
    const aParsed = parseDomainLine(a);
    const bParsed = parseDomainLine(b);
    const aDomain = aParsed.domain || '';
    const bDomain = bParsed.domain || '';
    return aDomain.localeCompare(bDomain);
  });

  return [
    ...headerComments,
    ...sortedDomains,
    ...specialLines,
    ...comments
  ].join('\n');
};

// 去重域名
export const dedupeDomains = (sourceInput: string): { content: string; removedCount: number } => {
  const lines = sourceInput.split('\n');

  const seen = new Set<string>();
  const uniqueLines: string[] = [];
  let removedCount = 0;

  for (const line of lines) {
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      uniqueLines.push(line);
      continue;
    }

    if (parsed.type === 'comment') {
      uniqueLines.push(line);
      continue;
    }

    if (!parsed.isValid) {
      uniqueLines.push(line);
      continue;
    }

    let key: string;
    if (parsed.type === 'whitelist' && parsed.domain) {
      key = '+' + parsed.domain;
    } else if (parsed.type === 'customDns' && parsed.domain && parsed.ip) {
      key = '@' + parsed.domain + '=' + parsed.ip;
    } else if (parsed.domain) {
      key = parsed.domain;
    } else {
      key = line;
    }

    if (!seen.has(key)) {
      seen.add(key);
      uniqueLines.push(line);
    } else {
      removedCount++;
    }
  }

  return {
    content: uniqueLines.join('\n'),
    removedCount
  };
};
