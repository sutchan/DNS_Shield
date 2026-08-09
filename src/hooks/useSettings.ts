// src/hooks/useSettings.ts v3.7.6
// 设置管理 hook —— 从 Home.tsx 拆分
import { useState, useCallback } from 'react';
import { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  projectName: 'DNS Shield',
  version: '3.7.6',
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

// 输入框 id -> settings key 的显式映射，避免脆弱的字符串替换。
// 提升为模块级常量，保持引用稳定（避免 useCallback 依赖告警）。
const FIELD_MAP: Record<string, keyof Settings> = {
  projectNameInput: 'projectName',
  versionInput: 'version',
  ipv4Input: 'ipv4',
  ipv6Input: 'ipv6',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key = FIELD_MAP[id];
    if (!key) return;
    setSettings((prev: Settings) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return {
    settings,
    setSettings,
    updateSettings
  };
};
