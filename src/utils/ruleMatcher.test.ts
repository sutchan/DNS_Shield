// src/utils/ruleMatcher.test.ts v3.10.0
import { describe, it, expect } from 'vitest';
import { normalizeQueryDomain, isDomainMatch, matchDomainRule } from './ruleMatcher';
import { ParsedData } from '../types';

describe('ruleMatcher', () => {
  describe('normalizeQueryDomain', () => {
    it('normalizes simple domains and URLs', () => {
      expect(normalizeQueryDomain('https://example.com/path?q=1')).toBe('example.com');
      expect(normalizeQueryDomain('HTTP://Sub.Example.COM:8080/')).toBe('sub.example.com');
      expect(normalizeQueryDomain('*.ads.tracker.org')).toBe('ads.tracker.org');
      expect(normalizeQueryDomain('  ...ad.doubleclick.net...  ')).toBe('ad.doubleclick.net');
      expect(normalizeQueryDomain('')).toBe('');
    });
  });

  describe('isDomainMatch', () => {
    it('matches exact domain and subdomains', () => {
      expect(isDomainMatch('example.com', 'example.com')).toBe(true);
      expect(isDomainMatch('sub.example.com', 'example.com')).toBe(true);
      expect(isDomainMatch('deep.sub.example.com', 'example.com')).toBe(true);
      expect(isDomainMatch('notexample.com', 'example.com')).toBe(false);
      expect(isDomainMatch('example.com.cn', 'example.com')).toBe(false);
      expect(isDomainMatch('', 'example.com')).toBe(false);
      expect(isDomainMatch('example.com', '')).toBe(false);
    });
  });

  describe('matchDomainRule', () => {
    const mockData: ParsedData = {
      domains: ['ad.tracker.com', 'doubleclick.net', 'analytics.google.com'],
      whitelist: ['safe.doubleclick.net', 'allowed.org'],
      customDns: [{ domain: 'router.lan', ip: '192.168.1.1' }],
    };

    it('prioritizes whitelist over blacklist', () => {
      const res = matchDomainRule('safe.doubleclick.net', mockData);
      expect(res.action).toBe('whitelisted');
      expect(res.matchedRule).toBe('safe.doubleclick.net');
    });

    it('matches custom DNS redirection', () => {
      const res = matchDomainRule('sub.router.lan', mockData);
      expect(res.action).toBe('customDns');
      expect(res.targetIp).toBe('192.168.1.1');
    });

    it('matches blacklisted domain and subdomains', () => {
      const res1 = matchDomainRule('ad.doubleclick.net', mockData);
      expect(res1.action).toBe('blocked');
      expect(res1.matchedRule).toBe('doubleclick.net');

      const res2 = matchDomainRule('analytics.google.com', mockData);
      expect(res2.action).toBe('blocked');
      expect(res2.matchedRule).toBe('analytics.google.com');
    });

    it('passes unblocked domain', () => {
      const res = matchDomainRule('https://github.com', mockData);
      expect(res.action).toBe('passed');
      expect(res.normalizedDomain).toBe('github.com');
    });

    it('handles empty or whitespace inputs gracefully', () => {
      const res = matchDomainRule('   ', mockData);
      expect(res.action).toBe('passed');
      expect(res.normalizedDomain).toBe('');
    });
  });
});
