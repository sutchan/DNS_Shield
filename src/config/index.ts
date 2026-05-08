// src/config/index.ts v2.2.6

// 类型声明
declare const process: {
  env: {
    NEXT_PUBLIC_DOMAINS_URL?: string;
    NEXT_PUBLIC_PRESET_BUILTIN?: string;
    NEXT_PUBLIC_PRESET_ADGUARD?: string;
    NEXT_PUBLIC_PRESET_EASYLIST?: string;
    NEXT_PUBLIC_PRESET_NEOHOSTS?: string;
  };
};

// 应用配置
export const config = {
  domainsUrl: process.env.NEXT_PUBLIC_DOMAINS_URL || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt',
  presets: {
    builtin: process.env.NEXT_PUBLIC_PRESET_BUILTIN || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt',
    adguard: process.env.NEXT_PUBLIC_PRESET_ADGUARD || 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
    easylist: process.env.NEXT_PUBLIC_PRESET_EASYLIST || 'https://easylist-downloads.adblockplus.org/easylist.txt',
    neohosts: process.env.NEXT_PUBLIC_PRESET_NEOHOSTS || 'https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt'
  }
};