// src/utils/statsAggregator.test.ts v3.10.1
import { describe, it, expect } from 'vitest';
import { buildParseStats } from './statsAggregator';
import { ParseResult } from '../types/formats';

describe('statsAggregator', () => {
  it('aggregates stats accurately across various entry types', () => {
    const entries: ParseResult[] = [
      { originalLine: '# comment', type: 'comment' },
      { originalLine: 'example.com', type: 'domain', isValid: true },
      { originalLine: '+whitelist.com', type: 'whitelist', isValid: true },
      { originalLine: '127.0.0.1 bad.com', type: 'hosts', isValid: true },
      { originalLine: '@router.lan 192.168.1.1', type: 'customDns', isValid: true },
      { originalLine: 'invalid..domain', type: 'domain', isValid: false },
    ];

    const stats = buildParseStats(entries);
    expect(stats.totalLines).toBe(6);
    expect(stats.commentCount).toBe(1);
    expect(stats.whitelistCount).toBe(1);
    expect(stats.customDnsCount).toBe(1);
    expect(stats.domainCount).toBe(4); // whitelist + domain + hosts + invalid domain
    expect(stats.blacklistCount).toBe(2); // customDns + hosts
    expect(stats.validCount).toBe(4);
    expect(stats.invalidCount).toBe(1);
  });
});
