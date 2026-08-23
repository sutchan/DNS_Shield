// src/utils/headerConfigs.ts v3.8.0
// 各输出格式的头部注释配置（注释符、分隔符、标题/描述/用法 i18n 键），
// 从 rulesGenerator.ts 拆分以保持生成器主文件聚焦规则生成逻辑。
import type { FormatType } from '../types';

export interface HeaderConfig {
  commentChar: string;
  separator: string;
  title: string;
  description: string;
  usage: string;
}

/** 每种格式的头部展示配置；usage 存 i18n 键路径，须经 resolve 解析，禁止直接输出字面量 */
export const HEADER_CONFIGS: Record<FormatType, HeaderConfig> = {
  dnsmasq: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.dnsmasqTitle',
    description: 'header.dnsmasqDescription',
    usage: 'header.merlinUsage',
  },
  hosts: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.hostsTitle',
    description: 'header.hostsDescription',
    usage: 'header.hostsUsage',
  },
  adguard: {
    commentChar: '!',
    separator: '====================================',
    title: 'header.adguardTitle',
    description: 'header.adguardDescription',
    usage: '',
  },
  unbound: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.unboundTitle',
    description: 'header.unboundDescription',
    usage: 'header.unboundUsage',
  },
  pihole: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.piholeTitle',
    description: 'header.piholeDescription',
    usage: 'header.piholeUsage',
  },
  domains: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.domainsTitle',
    description: 'header.domainsDescription',
    usage: 'header.domainsUsage',
  },
  bind: {
    commentChar: ';',
    separator: '=====================================',
    title: 'header.bindTitle',
    description: 'header.bindDescription',
    usage: 'header.bindUsage',
  },
  smartdns: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.smartdnsTitle',
    description: 'header.smartdnsDescription',
    usage: 'header.smartdnsUsage',
  },
  // 白名单为独立导出，复用 hosts 头部样式（# 注释）。
  whitelist: {
    commentChar: '#',
    separator: '=====================================',
    title: 'whitelist.title',
    description: 'whitelist.label',
    usage: '',
  },
};
