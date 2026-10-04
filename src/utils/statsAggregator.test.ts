// src/utils/statsAggregator.test.ts v3.10.0
import { describe, it, expect } from 'vitest';
import { buildParseStats } from './statsAggregator';
import { ParseResult } from '../types/formats';

describe('statsAggregator', () => {
  it('aggregates stats accurately across various entry types', () => {
    const entries: ParseResult[] = [
      { raw: '# comment', type: 'comment', line: 1 },
      { raw: 'example.com', type: 'domain', line: 2, isValid: true },
      { raw: '+whitelist.com', type: 'whitelist', line: 3, isValid: true },
      { raw: '127.0.0.1 bad.com', type: 'hosts', line: 4, isValid: true },
      { raw: '@router.lan 192.168.1.1', type: 'customDns', line: 5, isValid: true },
      { raw: 'invalid..domain', type: 'domain', line: 6, isValid: false },
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
