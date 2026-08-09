// src/utils/rulesGenerator.test.ts v3.7.4
import { describe, it, expect } from 'vitest';
import { generateRules, generateHeader } from './rulesGenerator';
import { parseSource } from './parser';
import { getTranslation } from './i18n';
import type { Settings, CustomDnsEntry } from '../types';

const t = getTranslation('zh-cn');

const baseSettings: Settings = {
  projectName: 'DNS Shield',
  version: '3.6.1',
  ipv4: '127.0.0.1',
  ipv6: '::',
  addHeader: true,
  blockIPv6: false,
  dedupDomains: true,
  removeWildcard: true,
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt',
};

describe('generateRules', () => {
  it('生成正确的 Dnsmasq / Hosts / AdGuard 黑名单规则', () => {
    const out = generateRules(['ad.example.com', 'ads.example.com'], [], [], baseSettings, t);
    expect(out.dnsmasq).toContain('address=/ad.example.com/127.0.0.1');
    expect(out.dnsmasq).toContain('address=/ads.example.com/127.0.0.1');
    expect(out.hosts).toContain('127.0.0.1 ad.example.com');
    expect(out.adguard).toContain('||ad.example.com^');
  });

  it('白名单生成 server=/domain/ 与 @@||domain^ 规则', () => {
    const out = generateRules([], ['api.example.com'], [], baseSettings, t);
    expect(out.dnsmasq).toContain('server=/api.example.com/');
    expect(out.hosts).toContain('# 已白名单: api.example.com');
    expect(out.adguard).toContain('@@||api.example.com^');
    expect(out.whitelist).toContain('@@||api.example.com^');
  });

  it('自定义 DNS 生成指定 IP 的解析规则', () => {
    const customDns: CustomDnsEntry[] = [{ domain: 'cdn.example.com', ip: '10.0.0.1' }];
    const out = generateRules([], [], customDns, baseSettings, t);
    expect(out.dnsmasq).toContain('address=/cdn.example.com/10.0.0.1');
    expect(out.hosts).toContain('10.0.0.1 cdn.example.com');
  });

  it('blockIPv6 开启时为黑名单追加 IPv6 规则', () => {
    const out = generateRules(['ad.example.com'], [], [], { ...baseSettings, blockIPv6: true }, t);
    expect(out.dnsmasq).toContain('address=/ad.example.com/::');
    expect(out.hosts).toContain(':: ad.example.com');
  });

  it('removeWildcard 开启时去除通配符前缀', () => {
    const out = generateRules(['*.ad.example.com'], [], [], baseSettings, t);
    expect(out.dnsmasq).toContain('address=/ad.example.com/127.0.0.1');
    expect(out.dnsmasq).not.toContain('*.');
  });

  it('addHeader 关闭时不生成头部注释', () => {
    const out = generateRules(['ad.example.com'], [], [], { ...baseSettings, addHeader: false }, t);
    expect(out.hosts).not.toContain('# DNS Shield');
    expect(out.hosts).toContain('127.0.0.1 ad.example.com');
  });

  it('dedupDomains 开启时自动去重', () => {
    const out = generateRules(['ad.example.com', 'ad.example.com'], [], [], baseSettings, t);
    const matches = out.dnsmasq.match(/address=\/ad\.example\.com\//g) || [];
    expect(matches.length).toBe(1);
  });

  it('完整流水线：源文本含 + 前缀白名单时，生成能正确产出白名单规则', () => {
    // 复现 bug：仅依赖解析后的 parsedData 时，若防抖解析尚未执行，白名单会丢失。
    // 修复后 generateRules 实时解析 sourceInput，保证白名单被正确生成。
    const source = 'ad.example.com\n+api.example.com\n+b.api.example.com';
    const { data } = parseSource(source);
    const out = generateRules(data.domains, data.whitelist, data.customDns, baseSettings, t);
    expect(data.whitelist).toEqual(['api.example.com', 'b.api.example.com']);
    expect(out.dnsmasq).toContain('server=/api.example.com/');
    expect(out.adguard).toContain('@@||api.example.com^');
    expect(out.whitelist).toContain('@@||b.api.example.com^');
    // 白名单域名不应出现在黑名单中
    expect(out.hosts).not.toContain('127.0.0.1 api.example.com');
    expect(out.hosts).toContain('# 已白名单: api.example.com');
  });
});

describe('generateHeader', () => {
  it('hosts 头部包含项目名与版本', () => {
    const header = generateHeader('hosts', 10, 2, '2026.07.21', baseSettings, t);
    expect(header).toContain('DNS Shield');
    expect(header).toContain('3.6.1');
    expect(header).toContain('10 个唯一域名');
  });

  it('adguard 头部使用 ! 注释符', () => {
    const header = generateHeader('adguard', 5, 0, '2026.07.21', baseSettings, t);
    expect(header.startsWith('!')).toBe(true);
  });
});
