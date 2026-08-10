// src/utils/parser.ts v3.7.21
import { parseDomainLine, ParseStats } from './domainValidator';
import { CustomDnsEntry, ParsedData } from '../types';

// 排序 / 去重职责抽离到 sortDedupe，保持公开 API 稳定
export { sortDomains, dedupeDomains } from './sortDedupe';

// 解析源文本（hosts / dnsmasq / adguard / 无限界文本），输出结构化数据
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
  const whitelistSet = new Set(whitelist.map((w) => w.replace(/^\*\./, '')));
  // customDns 按 domain 去重（保留首次出现），避免生成重复 DNS 规则
  const seenCustomDns = new Set<string>();
  const uniqueCustomDns = customDns.filter((c) => {
    const key = c.domain.replace(/^\*\./, '');
    if (seenCustomDns.has(key)) return false;
    seenCustomDns.add(key);
    return true;
  });
  const customDnsSet = new Set(uniqueCustomDns.map((c) => c.domain.replace(/^\*\./, '')));
  const excludeSet = new Set([...whitelistSet, ...customDnsSet]);

  const filteredDomains = domains.filter((d) => !excludeSet.has(d.replace(/^\*\./, '')));
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
      customDns: uniqueCustomDns
    },
    stats
  };
};




