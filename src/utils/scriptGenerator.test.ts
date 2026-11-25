// src/utils/scriptGenerator.test.ts v3.22.0
import { describe, it, expect } from 'vitest';
import { generateRouterScript } from './scriptGenerator';

describe('scriptGenerator', () => {
  const testUrl = 'https://example.com/dnsmasq.conf';

  it('generates OpenWrt script correctly', () => {
    const script = generateRouterScript({ ruleUrl: testUrl, target: 'openwrt' });
    expect(script).toContain('#!/bin/sh');
    expect(script).toContain('/etc/dnsmasq.d');
    expect(script).toContain(testUrl);
    expect(script).toContain('/etc/init.d/dnsmasq restart');
  });

  it('generates AsusWRT-Merlin script correctly', () => {
    const script = generateRouterScript({ ruleUrl: testUrl, target: 'merlin' });
    expect(script).toContain('/jffs/configs/dnsmasq.conf.add');
    expect(script).toContain('service restart_dnsmasq');
  });

  it('generates Padavan script correctly', () => {
    const script = generateRouterScript({ ruleUrl: testUrl, target: 'padavan' });
    expect(script).toContain('mtd_storage.sh save');
  });

  it('generates SmartDNS script correctly', () => {
    const script = generateRouterScript({ ruleUrl: testUrl, target: 'smartdns' });
    expect(script).toContain('/etc/smartdns/conf.d');
    expect(script).toContain('smartdns restart');
  });

  it('generates Pi-hole script correctly', () => {
    const script = generateRouterScript({ ruleUrl: testUrl, target: 'pihole' });
    expect(script).toContain('/etc/pihole/custom.list');
    expect(script).toContain('pihole restartdns reload');
  });

  // T-AUD-H03：脚本以 root 覆盖 dnsmasq 配置，任何 TLS 校验降级都属高危回归
  it('never disables TLS certificate verification (T-AUD-H03)', () => {
    const targets = ['openwrt', 'merlin', 'padavan', 'smartdns', 'pihole'] as const;
    for (const target of targets) {
      const script = generateRouterScript({ ruleUrl: testUrl, target });
      expect(script, target).not.toContain('-k ');
      expect(script, target).not.toContain('--no-check-certificate');
    }
  });
});
