// src/utils/parser.ts v3.0.0
import { CustomDnsEntry, ParsedData } from '../types';

interface ParseResult {
  type: 'empty' | 'comment' | 'whitelist' | 'customDns' | 'hosts' | 'dnsmasq' | 'adguard' | 'domain';
  domain?: string;
  ip?: string;
  isValid?: boolean;
  originalLine: string;
}

interface ParseStats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
}

// 解析域名行
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
  
  if (content.startsWith('+')) {
    const domain = content.substring(1).trim().toLowerCase().replace(/^\*\./, '');
    const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
    return {
      type: 'whitelist',
      domain: domain,
      isValid: isValid,
      originalLine: line
    };
  }
  
  if (content.startsWith('@')) {
    const match = content.substring(1).trim().match(/^([^=]+)=(.+)$/);
    if (match) {
      const domain = match[1].toLowerCase().replace(/^\*\./, '');
      const ip = match[2].trim();
      const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
      return {
        type: 'customDns',
        domain: domain,
        ip: ip,
        isValid: isValid,
        originalLine: line
      };
    }
    return { type: 'comment', originalLine: line };
  }
  
  if (content.startsWith('0.0.0.0 ') || content.startsWith('127.0.0.1 ')) {
    const domain = content.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, '').toLowerCase().replace(/^\*\./, '');
    const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
    return {
      type: 'hosts',
      domain: domain,
      isValid: isValid,
      originalLine: line
    };
  }
  
  if (content.startsWith('address=/')) {
    const match = content.match(/address=\/([^\/]+)\//);
    if (match) {
      const domain = match[1].toLowerCase().replace(/^\*\./, '');
      const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
      return {
        type: 'dnsmasq',
        domain: domain,
        isValid: isValid,
        originalLine: line
      };
    }
    return { type: 'comment', originalLine: line };
  }
  
  if (content.startsWith('||') && content.endsWith('^')) {
    const domain = content.substring(2, content.length - 1).toLowerCase().replace(/^\*\./, '');
    const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
    return {
      type: 'adguard',
      domain: domain,
      isValid: isValid,
      originalLine: line
    };
  }
  
  const domain = content.toLowerCase().replace(/^\*\./, '');
  const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
  return {
    type: 'domain',
    domain: domain,
    isValid: isValid,
    originalLine: line
  };
};

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
    commentCount: commentCount,
    blacklistCount: filteredDomains.length,
    whitelistCount: uniqueWhitelist.length
  };

  return {
    data: {
      domains: filteredDomains,
      whitelist: uniqueWhitelist,
      customDns: customDns
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
    const parsed = parseDomainLine(line);
    return parsed.type === 'domain' || parsed.type === 'hosts' || parsed.type === 'dnsmasq';
  });
  
  const comments = bodyLines.filter(line => {
    const parsed = parseDomainLine(line);
    return parsed.type === 'comment';
  });
  
  const sortedDomains = [...plainDomains].sort((a, b) => {
    const aParsed = parseDomainLine(a);
    const bParsed = parseDomainLine(b);
    const aDomain = 'domain' in aParsed && aParsed.domain ? aParsed.domain : '';
    const bDomain = 'domain' in bParsed && bParsed.domain ? bParsed.domain : '';
    return aDomain.localeCompare(bDomain);
  });
  
  const result = [
    ...headerComments,
    ...sortedDomains,
    ...specialLines,
    ...comments
  ];
  
  return result.join('\n');
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
    if (parsed.type === 'whitelist' && 'domain' in parsed && parsed.domain) {
      key = '+' + parsed.domain;
    } else if (parsed.type === 'customDns' && 'domain' in parsed && 'ip' in parsed && parsed.domain && parsed.ip) {
      key = '@' + parsed.domain + '=' + parsed.ip;
    } else if ('domain' in parsed && parsed.domain) {
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