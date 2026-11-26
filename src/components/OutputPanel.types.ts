// src/components/OutputPanel.types.ts v3.22.4
// OutputPanel 的 props 契约（从主组件拆出，保持主文件 ≤200 行）。
import type * as React from 'react';
import type { Language, Settings as SettingsType, FormatType, ParsedData } from '../types';

export interface OutputPanelProps {
  /** 当前格式的规则文本（惰性生成，T-P1-06） */
  currentOutput: string;
  currentFormat: FormatType;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  settings: SettingsType;
  parsedData: ParsedData;
  /** 分类过滤后的数据，用于统计口径与产物一致 */
  effectiveData?: ParsedData;
  outputPreviewRef: React.RefObject<HTMLDivElement>;
  outputLineNumbersRef: React.RefObject<HTMLDivElement>;
  setFormat: (format: FormatType) => void;
  generateRules: () => void;
  downloadOutput: () => void;
  copyOutput: () => void;
  syncOutputScroll: () => void;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentLang: string;
  supportedLanguages: Language[];
  switchLang: (lang: string) => void;
  showToast?: (key: string) => void;
}
