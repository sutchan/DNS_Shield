// src/config/index.ts v3.7.0
// @types/node 已提供 process.env 类型，无需重复声明

// 应用配置
export const config = {
  domainsUrl: process.env.NEXT_PUBLIC_DOMAINS_URL || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/domains.txt',
  presets: {
    builtin: process.env.NEXT_PUBLIC_PRESET_BUILTIN || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/domains.txt',
    adguard: process.env.NEXT_PUBLIC_PRESET_ADGUARD || 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
    easylist: process.env.NEXT_PUBLIC_PRESET_EASYLIST || 'https://easylist-downloads.adblockplus.org/easylist.txt',
    neohosts: process.env.NEXT_PUBLIC_PRESET_NEOHOSTS || 'https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt'
  }
};