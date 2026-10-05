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

// defaults.json 只含「可静态决定」的字段；version 取自 APP_VERSION 单一来源，
// visibleFormats 是纯运行时状态（默认全部显示），二者不放在 JSON 里。
const STATIC_DEFAULTS = defaults as Omit<Settings, 'version' | 'visibleFormats'>;

const DEFAULT_SETTINGS: Settings = {
  ...STATIC_DEFAULTS,
  version: APP_VERSION,
  visibleFormats: []
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  return {
    settings,
    setSettings
  };
};




