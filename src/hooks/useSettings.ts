// src/hooks/useSettings.ts v3.4.0
// 设置管理 hook —— 从 Home.tsx 拆分
import { useState, useCallback } from 'react';
import { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  projectName: 'DNS Shield',
  version: '3.4.0',
  ipv4: '127.0.0.1',
  ipv6: '::',
  addHeader: true,
  blockIPv6: false,
  dedupDomains: true,
  removeWildcard: true,
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt'
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev: Settings) => ({
      ...prev,
      [id.replace('Input', '')]: value
    }));
  }, []);

  return {
    settings,
    setSettings,
    updateSettings
  };
};
