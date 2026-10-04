// src/hooks/useSettings.ts v3.11.1
// 设置管理 hook —— 从 Home.tsx 拆分。
// 各字段由 SettingsForm 直接以 setSettings(prev => ...) 就地更新，
// 早期基于 input id 的通用 updateSettings 回调已随表单重构移除（死代码）。
import { useState } from 'react';
import { Settings } from '../types';
import { APP_VERSION } from '../config/version';

const DEFAULT_SETTINGS: Settings = {
  projectName: 'DNS Shield',
  version: APP_VERSION,
  ipv4: '127.0.0.1',
  ipv6: '::',
  addHeader: true,
  blockIPv6: false,
  dedupDomains: true,
  removeWildcard: true,
  adguardIncludeWhitelist: true,
  showAllFormats: true,
  visibleFormats: [],
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt',
  unboundFilename: 'unbound.conf',
  piholeFilename: 'pihole.txt',
  domainsFilename: 'domains.txt',
  bindFilename: 'rpz.db',
  smartdnsFilename: 'smartdns.conf',
  mosdnsFilename: 'mosdns_domain_set.txt',
  clashFilename: 'clash_dns.yaml',
  corednsFilename: 'coredns_hosts.txt'
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  return {
    settings,
    setSettings
  };
};




