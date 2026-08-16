// src/config/index.ts v3.7.24
// @types/node 已提供 process.env 类型，无需重复声明

// 预设源：每个 preset 提供多个镜像（github 主源 + jsdelivr 镜像），
// 主源（如 raw.githubusercontent.com）被墙时可自动降级，保证预设可用。
const PRESET_MIRRORS = {
  builtin: [
    process.env.NEXT_PUBLIC_PRESET_BUILTIN || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/domains.txt',
    'https://cdn.jsdelivr.net/gh/sutchan/DNS_Shield@main/public/domains.txt'
  ],
  adguard: [
    process.env.NEXT_PUBLIC_PRESET_ADGUARD || 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
    'https://cdn.jsdelivr.net/gh/AdguardTeam/FiltersRegistry@master/filters/filter_15_DnsFilter/filter.txt'
  ],
  easylist: [
    process.env.NEXT_PUBLIC_PRESET_EASYLIST || 'https://easylist-downloads.adblockplus.org/easylist.txt',
    'https://cdn.jsdelivr.net/gh/easylist/easylist@master/easylist.txt'
  ],
  neohosts: [
    process.env.NEXT_PUBLIC_PRESET_NEOHOSTS || 'https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt',
    'https://cdn.jsdelivr.net/gh/neoHosts/neoHosts@master/data/adblock.txt'
  ]
} as const;

// 应用配置
export const config = {
  domainsUrl: process.env.NEXT_PUBLIC_DOMAINS_URL || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/domains.txt',
  presets: PRESET_MIRRORS
};

// 预设镜像数组类型（按优先级降序，首个为主源）
export type PresetName = keyof typeof PRESET_MIRRORS;
export const presetMirrors = PRESET_MIRRORS;



