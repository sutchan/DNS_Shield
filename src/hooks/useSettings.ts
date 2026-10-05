// src/hooks/useSettings.ts v3.12.0
// 设置管理 hook —— 从 Home.tsx 拆分。
// 默认值来自 src/config/defaults.json（与 scripts/gen-format-files.mjs 共用的唯一来源），
// version 例外：取自 APP_VERSION 单一来源；visibleFormats 为纯运行时状态，不在 JSON 内。
// 各字段由 SettingsForm 直接以 setSettings(prev => ...) 就地更新，
// 早期基于 input id 的通用 updateSettings 回调已随表单重构移除（死代码）。
import { useState } from 'react';
import { Settings } from '../types';
import { APP_VERSION } from '../config/version';
import defaults from '../config/defaults.json';

const { visibleFormats: _initialVisibleFormats, version: _version, ...restDefaults } = defaults;

const DEFAULT_SETTINGS: Settings = {
  ...restDefaults,
  version: APP_VERSION,
  visibleFormats: []
} as Settings;

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  return {
    settings,
    setSettings
  };
};




