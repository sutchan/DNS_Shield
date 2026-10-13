// src/components/OutputPanel.derived.ts v3.13.0
// OutputPanel 的纯逻辑派生：格式标签映射与可见格式计算（与 JSX 展示组件分离）。
// 从 OutputPanel.parts.tsx 抽离以保持该文件 ≤200 行，逻辑与展示单一职责。
// 惰性生成（T-P1-06）后不再持有全量 OutputContent，可见格式改由输入数据推导：
// 各规则段实际会产出内容的格式集合须与 formatGenerators.ts 的 build* 语义 1:1。
import * as React from 'react';
import { FormatType } from '../types';
import type { Settings, ParsedData } from '../types';
import type { Translation } from '../types/translation';
import { ALL_FORMATS, CORE_FORMATS } from '../types/formats';
import { prepareRuleData } from '../utils/rulesGenerator';

// 各输出格式的展示标签：优先用专属翻译键，缺省回退到 hostsFormat，保证新增格式不致空白。
export function buildFormatLabel(t: Translation): Record<FormatType, string> {
  return {
    hosts: t.hostsFormat,
    dnsmasq: t.dnsmasqFormat,
    adguard: t.adguardFormat,
    whitelist: t.whitelistFormat,
    unbound: t.unboundFormat ?? t.hostsFormat,
    pihole: t.piholeFormat ?? t.hostsFormat,
    domains: t.domainsFormat ?? t.hostsFormat,
    bind: t.bindFormat ?? t.hostsFormat,
    smartdns: t.smartdnsFormat ?? t.hostsFormat,
    mosdns: t.mosdnsFormat ?? t.hostsFormat,
    clash: t.clashFormat ?? t.hostsFormat,
    coredns: t.corednsFormat ?? t.hostsFormat,
  };
}

// 黑名单段产出的格式（buildBlockedRules：除 whitelist 外全部）
const BLOCKED_FORMATS: ReadonlySet<FormatType> = new Set<FormatType>([
  'dnsmasq', 'hosts', 'adguard', 'unbound', 'pihole',
  'domains', 'bind', 'smartdns', 'mosdns', 'clash', 'coredns'
]);
// 自定义 DNS 段产出的格式（buildCustomDnsRules）
const CUSTOM_DNS_FORMATS: ReadonlySet<FormatType> = new Set<FormatType>([
  'dnsmasq', 'hosts', 'adguard', 'pihole', 'smartdns', 'coredns'
]);
// 白名单段产出的格式（buildWhitelistRules；adguard 另受 adguardIncludeWhitelist 开关控制）
const WHITELIST_FORMATS: ReadonlySet<FormatType> = new Set<FormatType>([
  'dnsmasq', 'hosts', 'adguard', 'whitelist', 'unbound',
  'domains', 'smartdns', 'mosdns', 'clash', 'coredns'
]);
// 正则段产出的格式（buildRegexRules：仅 adguard / pihole）
const REGEX_FORMATS: ReadonlySet<FormatType> = new Set<FormatType>(['adguard', 'pihole']);

// 可见格式列表：结合 showAllFormats（全部/核心）与 visibleFormats（逐格式显示/隐藏开关），
// 并过滤掉不会有产出的格式，避免空 Tab。产出判定与全量生成 1:1（经 prepareRuleData 复用同一变换）。
export function useVisibleFormats(
  settings: Settings,
  parsedData: ParsedData
): FormatType[] {
  return React.useMemo<FormatType[]>(() => {
    const base = settings.showAllFormats ? ALL_FORMATS : CORE_FORMATS;
    const filtered = settings.visibleFormats.length > 0
      ? base.filter((f) => settings.visibleFormats.includes(f))
      : base;

    const { blockedDomains, filteredWhitelist, customDns } = prepareRuleData(
      parsedData.domains,
      parsedData.whitelist,
      parsedData.customDns,
      settings
    );
    const hasRegex = (parsedData.regexRules?.length ?? 0) > 0;
    const whitelistInAdguard = settings.adguardIncludeWhitelist;

    return filtered.filter(
      (f) =>
        (blockedDomains.length > 0 && BLOCKED_FORMATS.has(f)) ||
        (customDns.length > 0 && CUSTOM_DNS_FORMATS.has(f)) ||
        (filteredWhitelist.length > 0 &&
          WHITELIST_FORMATS.has(f) &&
          !(f === 'adguard' && !whitelistInAdguard)) ||
        (hasRegex && REGEX_FORMATS.has(f))
    );
  }, [
    settings.showAllFormats,
    settings.visibleFormats,
    settings.adguardIncludeWhitelist,
    settings.dedupDomains,
    settings.removeWildcard,
    parsedData
  ]);
}
