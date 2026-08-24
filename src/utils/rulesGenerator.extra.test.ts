// src/utils/rulesGenerator.extra.test.ts v3.9.0
// 从 rulesGenerator.test.ts 拆分出的补充用例：computeEffectiveStats 统计一致性
// 与 generateHeader 头部渲染校验（注释符、版本、用法文案解析）。与主文件共享 fixtures。
import { describe, it, expect } from 'vitest';
import { generateHeader, computeEffectiveStats } from './rulesGenerator';
import { getTranslation } from './i18n';
import { APP_VERSION } from '../config/version';
import type { Settings } from '../types';

const t = getTranslation('zh-cn');

const baseSettings: Settings = {
  projectName: 'DNS Shield',
  version: APP_VERSION,
  ipv4: '127.0.0.1',
  ipv6: '::',
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
};

describe('computeEffectiveStats', () => {
  it('去重后黑名单计数与生成结果一致（修复统计不符）', () => {
    const data = {
      domains: ['ad.example.com', 'ad.example.com', 'b.example.com'],
      whitelist: [],
      customDns: []
    };
    const s = { ...baseSettings, dedupDomains: true };
    const eff = computeEffectiveStats(data, s);
    expect(eff.blacklistCount).toBe(2);
    expect(eff.validCount).toBe(2);
    expect(eff.whitelistCount).toBe(0);
  });

  it('去通配后同一域名去重', () => {
    const data = { domains: ['*.ad.com', 'ad.com'], whitelist: [], customDns: [] };
    const s = { ...baseSettings, removeWildcard: true, dedupDomains: true };
    const eff = computeEffectiveStats(data, s);
    expect(eff.blacklistCount).toBe(1);
  });

  it('白名单从黑名单剔除，customDns 计入黑名单', () => {
    const data = {
      domains: ['ad.com', 'keep.com'],
      whitelist: ['ad.com'],
      customDns: [{ domain: 'cdn.com', ip: '1.2.3.4' }]
    };
    const s = { ...baseSettings };
    const eff = computeEffectiveStats(data, s);
    expect(eff.blacklistCount).toBe(2); // keep.com + cdn.com
    expect(eff.whitelistCount).toBe(1);
    expect(eff.validCount).toBe(3); // keep.com + ad.com(白名单) + cdn.com
  });
});

describe('generateHeader', () => {
  it('hosts 头部包含项目名与版本', () => {
    const header = generateHeader('hosts', 10, 2, '2026.07.21', baseSettings, t);
    expect(header).toContain('DNS Shield');
    expect(header).toContain(APP_VERSION);
    expect(header).toContain('10 个唯一域名');
  });

  it('adguard 头部使用 ! 注释符', () => {
    const header = generateHeader('adguard', 5, 0, '2026.07.21', baseSettings, t);
    expect(header.startsWith('!')).toBe(true);
  });
});
