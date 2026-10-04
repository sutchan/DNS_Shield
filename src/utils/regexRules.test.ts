// src/utils/regexRules.test.ts v3.11.0
import { describe, it, expect } from 'vitest';
import {
  parseRegexRule,
  toAdGuardRegex,
  toPiHoleRegex,
  convertRegexRule,
  extractRegexRules
} from './regexRules';

const ADS = '/^ads\\./';
const TRACK = 'regex:^track\\.';

describe('parseRegexRule', () => {
  it('识别 AdGuard 正则 /pattern/', () => {
    const rule = parseRegexRule(ADS);
    expect(rule).not.toBeNull();
    expect(rule?.source).toBe('adguard');
    expect(rule?.pattern).toBe('^ads\\.');
    expect(rule?.isException).toBe(false);
  });

  it('识别 AdGuard 例外 @@/pattern/ 为白名单语义', () => {
    const rule = parseRegexRule('@@/^safe\\./');
    expect(rule?.isException).toBe(true);
    expect(rule?.pattern).toBe('^safe\\.');
  });

  it('识别 Pi-hole FTL 的 regex:pattern（大小写不敏感）', () => {
    const rule = parseRegexRule('REGEX:^track\\.');
    expect(rule?.source).toBe('pihole');
    expect(rule?.pattern).toBe('^track\\.');
  });

  it('非正则行返回 null', () => {
    expect(parseRegexRule('example.com')).toBeNull();
    expect(parseRegexRule('0.0.0.0 ads.example.com')).toBeNull();
    expect(parseRegexRule('   ')).toBeNull();
  });
});

describe('双向转换', () => {
  it('AdGuard 正则可转换为 Pi-hole regex 语法', () => {
    const rule = parseRegexRule(ADS);
    expect(convertRegexRule(rule!, 'pihole')).toBe('regex:^ads\\.');
  });

  it('Pi-hole regex 可转换为 AdGuard 正则语法', () => {
    const rule = parseRegexRule(TRACK);
    expect(convertRegexRule(rule!, 'adguard')).toBe('/^track\\./');
  });

  it('例外规则转 Pi-hole 时以注释标注，不生成无效规则', () => {
    const rule = parseRegexRule('@@/^safe\\./');
    expect(convertRegexRule(rule!, 'pihole')).toBe('# regex:^safe\\.');
    expect(convertRegexRule(rule!, 'adguard')).toBe('@@/^safe\\./');
  });

  it('输出构造器符合各自主流语法', () => {
    expect(toAdGuardRegex('a')).toBe('/a/');
    expect(toAdGuardRegex('a', true)).toBe('@@/a/');
    expect(toPiHoleRegex('a')).toBe('regex:a');
  });
});

describe('extractRegexRules', () => {
  it('跳过注释与空行，仅提取正则规则', () => {
    const text = ['# comment', '', 'example.com', ADS, '! dnsmasq', TRACK].join('\n');
    const rules = extractRegexRules(text);
    expect(rules).toHaveLength(2);
    expect(rules[0].source).toBe('adguard');
    expect(rules[1].source).toBe('pihole');
  });
});
