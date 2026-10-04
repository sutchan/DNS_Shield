// src/components/OutputPanel.derived.ts v3.10.2
// OutputPanel 的纯逻辑派生：格式标签映射与可见格式计算（与 JSX 展示组件分离）。
// 从 OutputPanel.parts.tsx 抽离以保持该文件 ≤200 行，逻辑与展示单一职责。
import * as React from 'react';
import { FormatType } from '../types';
import type { Settings, OutputContent } from '../types';
import type { Translation } from '../types/translation';
import { ALL_FORMATS, CORE_FORMATS } from '../types/formats';

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

// 可见格式列表：结合 showAllFormats（全部/核心）与 visibleFormats（逐格式显示/隐藏开关），
// 并过滤掉无内容的格式，避免空 Tab。
export function useVisibleFormats(
  settings: Settings,
  outputContent: OutputContent
): FormatType[] {
  return React.useMemo<FormatType[]>(() => {
    const base = settings.showAllFormats ? ALL_FORMATS : CORE_FORMATS;
    const filtered = settings.visibleFormats.length > 0
      ? base.filter((f) => settings.visibleFormats.includes(f))
      : base;
    return filtered.filter((f) => outputContent[f]?.trim());
  }, [settings.showAllFormats, settings.visibleFormats, outputContent]);
}
