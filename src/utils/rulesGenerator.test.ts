// src/utils/rulesGenerator.test.ts v3.7.42
import { describe, it, expect } from 'vitest';
import { generateRules, generateHeader } from './rulesGenerator';
import { parseSource } from './parser';
import { getTranslation } from './i18n';
import { APP_VERSION } from '../config/version';
import type { Settings, CustomDnsEntry } from '../types';

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

  it('白名单域名被排除出 dnsmasq/hosts 黑洞规则（真正生效）', () => {
    const out = generateRules(
      ['ad.example.com', 'api.example.com'],
      ['api.example.com'],
      [],
      baseSettings,
      t
    );
    // dnsmasq 不应为白名单域名生成 address= 黑洞
    expect(out.dnsmasq).not.toContain('address=/api.example.com/');
    // hosts 不应为白名单域名生成拦截行
    expect(out.hosts).not.toContain('127.0.0.1 api.example.com');
    // 白名单域名仍保留在白名单区块（含说明注释）
    expect(out.hosts).toContain('# 已白名单: api.example.com');
    expect(out.hosts).toContain(t.whitelist.hostsNote);
    // 非白名单域名照常拦截
    expect(out.dnsmasq).toContain('address=/ad.example.com/127.0.0.1');
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

  it('生成 5 种新增格式（unbound/pihole/domains/bind/smartdns）规则', () => {
    const out = generateRules(['ad.example.com'], [], [], baseSettings, t);
    // Unbound: local-zone refuse
    expect(out.unbound).toContain('local-zone: "ad.example.com" refuse');
    // Pi-hole: 0.0.0.0 domain
    expect(out.pihole).toContain('0.0.0.0 ad.example.com');
    // 纯域名列表：仅域名本身
    expect(out.domains).toContain('ad.example.com');
    expect(out.domains).not.toContain('0.0.0.0');
    // Bind RPZ: CNAME . 含通配子域
    expect(out.bind).toContain('ad.example.com CNAME .');
    expect(out.bind).toContain('*.ad.example.com CNAME .');
    // SmartDNS: address /domain/#
    expect(out.smartdns).toContain('address /ad.example.com/#');
  });

  it('白名单在 unbound 生成 transparent、在 domains/smartdns 仅注释', () => {
    const out = generateRules(['ad.example.com', 'api.example.com'], ['api.example.com'], [], baseSettings, t);
    expect(out.unbound).toContain('local-zone: "api.example.com" transparent');
    expect(out.domains).toContain(`# ${t.whitelist.label} api.example.com`);
    expect(out.domains).not.toContain('\napi.example.com\n');
    expect(out.smartdns).toContain(`# ${t.whitelist.label} api.example.com`);
    // 白名单域名不出现在纯域名黑名单中
    const blocked = out.domains.split('\n').filter(l => l === 'api.example.com');
    expect(blocked.length).toBe(0);
  });

  it('自定义 DNS 生成 pihole 与 smartdns 规则', () => {
    const customDns: CustomDnsEntry[] = [{ domain: 'cdn.example.com', ip: '10.0.0.1' }];
    const out = generateRules([], [], customDns, baseSettings, t);
    expect(out.pihole).toContain('10.0.0.1 cdn.example.com');
    expect(out.smartdns).toContain('server /cdn.example.com/10.0.0.1');
  });

  it('新增格式头部使用对应注释符（bind 用 ;）', () => {
    const header = generateHeader('bind', 5, 0, '2026.07.21', baseSettings, t);
    expect(header.startsWith(';')).toBe(true);
    expect(header).toContain('Bind');
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




