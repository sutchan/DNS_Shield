// src/utils/parseLine.edge.test.ts v3.15.0
// 单行解析边界契约：
//   T-P2-07 AdGuard 内容恰为 "||" 时不得产生非法切片（Math.min 空数组 → Infinity）；
//   T-P2-08 hosts 行支持任意合法 IP 与 Tab 分隔（旧实现只认 0.0.0.0/127.0.0.1）；
//   T-P2-09 正则本体含 '#' 时不得被内联注释剥离截断。
import { describe, it, expect } from 'vitest';
import { parseDomainLine } from './parseLine';

describe('parseDomainLine · 边界契约', () => {
  it('T-P2-07：内容恰为 "||" 时返回空域名且不抛错', () => {
    const result = parseDomainLine('||');
    expect(result.type).toBe('adguard');
    expect(result.domain).toBe('');
    expect(result.isValid).toBe(false);
  });

  it('T-P2-08：任意合法 IPv4 的 hosts 行均可识别', () => {
    const result = parseDomainLine('10.0.0.1 cdn.example.com');
    expect(result.type).toBe('hosts');
    expect(result.domain).toBe('cdn.example.com');
    expect(result.isValid).toBe(true);
  });

  it('T-P2-08：hosts 行使用 Tab 分隔同样可识别', () => {
    const result = parseDomainLine('0.0.0.0\tads.example.com');
    expect(result.type).toBe('hosts');
    expect(result.domain).toBe('ads.example.com');
  });

  it('T-P2-08：非 IP 前缀的行不误判为 hosts', () => {
    const result = parseDomainLine('not-an-ip ads.example.com');
    expect(result.type).toBe('domain');
    expect(result.isValid).toBe(false);
  });

  it('T-P2-09：AdGuard 正则含 # 时不被截断', () => {
    const result = parseDomainLine('/\\d+#/');
    expect(result.type).toBe('regex');
    expect(result.pattern).toBe('\\d+#');
  });

  it('T-P2-09：Pi-hole 正则含 # 时不被截断', () => {
    const result = parseDomainLine('regex:/ads\\/#/');
    expect(result.type).toBe('regex');
    expect(result.pattern).toBe('/ads\\/#/');
  });

  it('普通域名行仍走纯域名分支', () => {
    const result = parseDomainLine('ads.example.com');
    expect(result.type).toBe('domain');
    expect(result.domain).toBe('ads.example.com');
    expect(result.isValid).toBe(true);
  });

  it('整行注释与空行分别归类', () => {
    expect(parseDomainLine('# 注释').type).toBe('comment');
    expect(parseDomainLine('   ').type).toBe('empty');
  });
});
