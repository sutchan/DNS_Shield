// src/utils/domainValidator.test.ts v3.6.1
import { describe, it, expect } from 'vitest';
import {
  isValidDomain,
  isValidIp,
  normalizeDomain,
  parseDomainLine,
} from './domainValidator';

describe('isValidDomain', () => {
  it('接受常规域名', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('a.b.c.example.com')).toBe(true);
    expect(isValidDomain('xn--fiqs8s.com')).toBe(true);
  });

  it('拒绝非法域名', () => {
    expect(isValidDomain('example')).toBe(false); // 无 TLD
    expect(isValidDomain('-example.com')).toBe(false); // 前导连字符
    expect(isValidDomain('example-.com')).toBe(false); // 尾随连字符
    expect(isValidDomain('exa mple.com')).toBe(false); // 空格
    expect(isValidDomain('')).toBe(false);
  });
});

describe('isValidIp', () => {
  it('接受合法 IPv4', () => {
    expect(isValidIp('0.0.0.0')).toBe(true);
    expect(isValidIp('127.0.0.1')).toBe(true);
    expect(isValidIp('255.255.255.255')).toBe(true);
  });

  it('拒绝越界/畸形 IPv4', () => {
    expect(isValidIp('256.0.0.1')).toBe(false);
    expect(isValidIp('1.2.3')).toBe(false);
    expect(isValidIp('1.2.3.4.5')).toBe(false);
    expect(isValidIp('abc')).toBe(false);
  });

  it('接受合法 IPv6', () => {
    expect(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(isValidIp('::1')).toBe(true);
  });
});

describe('normalizeDomain', () => {
  it('转小写并去除通配符前缀', () => {
    expect(normalizeDomain('*.Example.COM')).toBe('example.com');
    expect(normalizeDomain('Ads.Example.com')).toBe('ads.example.com');
  });
});

describe('parseDomainLine', () => {
  it('识别空行与注释', () => {
    expect(parseDomainLine('').type).toBe('empty');
    expect(parseDomainLine('   ').type).toBe('empty');
    expect(parseDomainLine('# comment').type).toBe('comment');
    expect(parseDomainLine('! adblock comment').type).toBe('comment');
  });

  it('解析白名单 (+)', () => {
    const r = parseDomainLine('+good.example.com');
    expect(r.type).toBe('whitelist');
    expect(r.domain).toBe('good.example.com');
    expect(r.isValid).toBe(true);
  });

  it('自定义 DNS 校验域名与 IP', () => {
    const ok = parseDomainLine('@example.com=1.2.3.4');
    expect(ok.type).toBe('customDns');
    expect(ok.domain).toBe('example.com');
    expect(ok.ip).toBe('1.2.3.4');
    expect(ok.isValid).toBe(true);

    const badIp = parseDomainLine('@example.com=999.1.1.1');
    expect(badIp.type).toBe('customDns');
    expect(badIp.isValid).toBe(false);
  });

  it('解析 hosts / dnsmasq / adguard', () => {
    expect(parseDomainLine('0.0.0.0 ads.example.com')).toMatchObject({
      type: 'hosts',
      domain: 'ads.example.com',
      isValid: true,
    });
    expect(parseDomainLine('address=/ads.example.com/0.0.0.0')).toMatchObject({
      type: 'dnsmasq',
      domain: 'ads.example.com',
      isValid: true,
    });
    expect(parseDomainLine('||ads.example.com^')).toMatchObject({
      type: 'adguard',
      domain: 'ads.example.com',
      isValid: true,
    });
  });

  it('剥离行内注释后解析纯域名', () => {
    const r = parseDomainLine('ads.example.com # tracker');
    expect(r.type).toBe('domain');
    expect(r.domain).toBe('ads.example.com');
    expect(r.isValid).toBe(true);
  });
});
