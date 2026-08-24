// src/utils/statsAggregator.ts v3.9.0
// 解析结果统计聚合：从 parseDomainLine 产出的 entry 列表计算各项计数。
// 与真实注释/空行分开统计，避免 stats 数字失真。
import type { ParseResult, ParseStats } from '../types/formats';

export const buildParseStats = (entries: ParseResult[]): ParseStats => {
  const stats: ParseStats = {
    domainCount: 0,
    validCount: 0,
    commentCount: 0,
    blacklistCount: 0,
    whitelistCount: 0,
    customDnsCount: 0,
    totalLines: 0,
    invalidCount: 0,
  };

  for (const entry of entries) {
    if (entry.type === 'comment') {
      stats.commentCount++;
    } else if (entry.type === 'whitelist') {
      stats.whitelistCount++;
      stats.domainCount++;
    } else if (entry.type === 'domain') {
      stats.domainCount++;
    } else if (entry.type === 'customDns') {
      stats.blacklistCount++;
      stats.customDnsCount++;
    } else if (entry.type === 'hosts' || entry.type === 'dnsmasq' || entry.type === 'adguard') {
      stats.blacklistCount++;
      stats.domainCount++;
    }

    if (entry.isValid === false) {
      stats.invalidCount++;
    } else if (entry.isValid === true) {
      stats.validCount++;
    }
  }

  stats.totalLines = entries.length;

  return stats;
};
