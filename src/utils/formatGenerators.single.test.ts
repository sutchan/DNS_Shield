// src/utils/formatGenerators.single.test.ts v3.13.0
// 单格式生成器与全量生成器的一致性断言（T-P1-06）：
// 对每种格式与多种设置/输入组合，generateSingleFormat(f) 必须与 generateRules()[f] 逐字节相等，
// 保证惰性生成不改变任何输出语义。
import { describe, it, expect, vi, afterAll } from 'vitest';
import { generateRules } from './rulesGenerator';
import { generateSingleFormat } from './formatGenerators.single';
import { getTranslation } from './i18n';
import { APP_VERSION } from '../config/version';
import { ALL_FORMATS } from '../types/formats';
import type { Settings, CustomDnsEntry, RegexRule } from '../types';

const t = getTranslation('zh-cn');

const baseSettings: Settings = {
  projectName: 'DNS Shield',
  version: APP_VERSION,
  ipv4: '127.0.0.1',
  ipv6: '::1',
  addHeader: true,
  blockIPv6: false,
  dedupDomains: true,
  removeWildcard: true,
  adguardIncludeWhitelist: true,
  showAllFormats: true,
  visibleFormats: [],
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt',
  unboundFilename: 'unbound.conf',
  piholeFilename: 'pihole.txt',
  domainsFilename: 'domains.txt',
  bindFilename: 'rpz.db',
  smartdnsFilename: 'smartdns.conf',
  mosdnsFilename: 'mosdns_domain_set.txt',
  clashFilename: 'clash_dns.yaml',
  corednsFilename: 'coredns_hosts.txt',
};

const customDns: CustomDnsEntry[] = [{ domain: 'cdn.example.com', ip: '10.0.0.1' }];
const regexRules: RegexRule[] = [
  { pattern: '/ads\\./', source: 'adguard', isException: false, originalLine: '/ads\\./' },
  { pattern: '/track/', source: 'pihole', isException: true, originalLine: 'regex:/track/' }
];

// 固定系统时间，避免两次调用跨日期导致头部「更新」行不一致
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-10-13T12:00:00'));
afterAll(() => {
  vi.useRealTimers();
});

interface Case {
  name: string;
  settings: Settings;
  domains: string[];
  whitelist: string[];
  customDns: CustomDnsEntry[];
  regexRules: RegexRule[];
}

const cases: Case[] = [
  {
    name: '黑名单 + 白名单 + 自定义 DNS + 正则（addHeader / IPv6 开）',
    settings: { ...baseSettings, blockIPv6: true },
    domains: ['ad.example.com', '*.ads.example.com', 'cdn.example.com'],
    whitelist: ['api.example.com', '*.safe.example.com'],
    customDns,
    regexRules
  },
  {
    name: '关闭头部注释',
    settings: { ...baseSettings, addHeader: false },
    domains: ['ad.example.com'],
    whitelist: ['api.example.com'],
    customDns,
    regexRules
  },
  {
    name: 'AdGuard 不含白名单豁免',
    settings: { ...baseSettings, adguardIncludeWhitelist: false },
    domains: ['ad.example.com'],
    whitelist: ['api.example.com'],
    customDns: [],
    regexRules: []
  },
  {
    name: '不去重 / 不去通配',
    settings: { ...baseSettings, dedupDomains: false, removeWildcard: false },
    domains: ['*.ads.example.com', 'ad.example.com', 'ad.example.com'],
    whitelist: [],
    customDns,
    regexRules: []
  },
  {
    name: '仅正则规则',
    settings: baseSettings,
    domains: [],
    whitelist: [],
    customDns: [],
    regexRules
  },
  {
    name: '空输入',
    settings: baseSettings,
    domains: [],
    whitelist: [],
    customDns: [],
    regexRules: []
  }
];

describe('generateSingleFormat 与 generateRules 一致性', () => {
  cases.forEach((c) => {
    it(c.name, () => {
      const full = generateRules(c.domains, c.whitelist, c.customDns, c.settings, t, c.regexRules);
      ALL_FORMATS.forEach((format) => {
        const single = generateSingleFormat(
          format,
          c.domains,
          c.whitelist,
          c.customDns,
          c.settings,
          t,
          c.regexRules
        );
        expect(single, `格式 ${format} 输出不一致`).toBe(full[format]);
      });
    });
  });

  it('白名单域名在黑名单中时被剔除（两处口径一致）', () => {
    const domains = ['ad.example.com', 'api.example.com'];
    const whitelist = ['api.example.com'];
    const full = generateRules(domains, whitelist, [], baseSettings, t);
    const single = generateSingleFormat('dnsmasq', domains, whitelist, [], baseSettings, t);
    expect(single).toBe(full.dnsmasq);
    expect(single).not.toContain('address=/api.example.com/');
    expect(single).toContain('server=/api.example.com/');
  });
});
