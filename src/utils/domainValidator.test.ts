// src/utils/domainValidator.test.ts v3.9.0
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
  it('转小写并保留通配符前缀（去留由 settings 决定）', () => {
    expect(normalizeDomain('*.Example.COM')).toBe('*.example.com');
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

  it('解析 AdGuard 白名单例外规则（含 $important 修饰符）', () => {
    const r = parseDomainLine('@@||api.io.mi.com^$important');
    expect(r.type).toBe('whitelist');
    expect(r.domain).toBe('api.io.mi.com');
    expect(r.isValid).toBe(true);
  });

  it('解析 AdGuard 白名单例外规则（无修饰符）', () => {
    const r = parseDomainLine('@@||api.io.mi.com^');
    expect(r.type).toBe('whitelist');
    expect(r.domain).toBe('api.io.mi.com');
    expect(r.isValid).toBe(true);
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
    // 带 $ 修饰符的 AdGuard 黑名单（修复前会被误判为无效域名）
    expect(parseDomainLine('||ads.example.com^$important')).toMatchObject({
      type: 'adguard',
      domain: 'ads.example.com',
      isValid: true,
    });
    // 无 ^ 结尾的 AdGuard 规则也应被识别
    expect(parseDomainLine('||ads.example.com')).toMatchObject({
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

  it('解析 Pi-hole 格式（0.0.0.0/127.0.0.1 + 行尾注释）', () => {
    expect(parseDomainLine('0.0.0.0 ads.example.com').type).toBe('hosts');
    expect(parseDomainLine('127.0.0.1 ads.example.com').type).toBe('hosts');
    // 行尾 # 注释应被剥离
    const r = parseDomainLine('0.0.0.0 ads.example.com # block');
    expect(r.type).toBe('hosts');
    expect(r.domain).toBe('ads.example.com');
  });

  it('解析 Bind RPZ 格式（CNAME .，保留通配符）', () => {
    const r1 = parseDomainLine('ads.example.com CNAME .');
    expect(r1.type).toBe('adguard');
    expect(r1.domain).toBe('ads.example.com');
    expect(r1.isValid).toBe(true);

    const r2 = parseDomainLine('*.ads.example.com CNAME .');
    expect(r2.type).toBe('adguard');
    expect(r2.domain).toBe('*.ads.example.com');
    expect(r2.isValid).toBe(true);
  });

  it('解析 SmartDNS 格式（address/server 黑名单，nameserver 白名单）', () => {
    const r1 = parseDomainLine('address /ads.example.com/#');
    expect(r1.type).toBe('adguard');
    expect(r1.domain).toBe('ads.example.com');

    const r2 = parseDomainLine('server /ads.example.com/1.2.3.4');
    expect(r2.type).toBe('adguard');
    expect(r2.domain).toBe('ads.example.com');

    const r3 = parseDomainLine('nameserver /good.example.com/#');
    expect(r3.type).toBe('whitelist');
    expect(r3.domain).toBe('good.example.com');
  });

  it('解析 Unbound 格式（refuse 黑名单，transparent 白名单）', () => {
    const r1 = parseDomainLine('local-zone: "ads.example.com" refuse');
    expect(r1.type).toBe('adguard');
    expect(r1.domain).toBe('ads.example.com');

    const r2 = parseDomainLine('local-zone: "good.example.com" transparent');
    expect(r2.type).toBe('whitelist');
    expect(r2.domain).toBe('good.example.com');
  });
});




