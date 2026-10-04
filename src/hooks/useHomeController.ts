// src/hooks/useHomeController.ts v3.10.2
// Home 页面的状态编排钩子：聚合所有领域钩子（主题/语言/域名数据/规则/URL/设置）
// 与稳定回调（showToast/effectiveStats/滚动/折叠/弹窗开关），保持 Home.tsx 仅负责渲染。
// 从 Home.tsx 抽离以控制主文件行数，公开渲染契约不变。

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Stats } from '../types';
import { logger } from '../utils/logger';
import { useTheme } from './useTheme';
import { useLanguage } from './useLanguage';
import { useDomainData } from './useDomainData';
import { useRules } from './useRules';
import { useUrlManager } from './useUrlManager';
import { useSettings } from './useSettings';

export interface HomeController {
  // 主题 / 语言
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentLang: string;
  supportedLanguages: { code: string; label: string }[];
  t: import('../types').Translation;
  switchLang: (code: string) => void;
  // 域名数据
  sourceInput: string;
  parsedData: import('../types').ParsedData;
  stats: Stats;
  setStats: React.Dispatch<React.SetStateAction<Stats>>;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  clearAll: () => void;
  sortDomains: () => void;
  dedupeDomains: () => void;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setSourceInput: React.Dispatch<React.SetStateAction<string>>;
  parseSourceData: () => void;
  showToast: (key: string, params?: Record<string, string | number>) => void;
  // 设置
  settings: import('../types').Settings;
  setSettings: React.Dispatch<React.SetStateAction<import('../types').Settings>>;
  updateSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // 规则
  outputContent: import('../types').OutputContent;
  currentFormat: import('../types').FormatType;
  outputPreviewRef: React.RefObject<HTMLDivElement>;
  outputLineNumbersRef: React.RefObject<HTMLDivElement>;
  generateRules: () => void;
  downloadOutput: () => void;
  copyOutput: () => void;
  setFormat: (format: import('../types').FormatType) => void;
  syncOutputScroll: () => void;
  // URL 管理
  urls: string[];
  isLoading: boolean;
  activePreset: string;
  urlInput: string;
  setUrlInput: React.Dispatch<React.SetStateAction<string>>;
  loadPreset: (preset: string) => void;
  fetchFromUrl: (url: string) => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  setUrls: React.Dispatch<React.SetStateAction<string[]>>;
  // 区域 / 弹窗状态
  isUrlSectionCollapsed: boolean;
  setIsUrlSectionCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isGuideOpen: boolean;
  setIsGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openGuide: () => void;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  syncScroll: () => void;
  toggleSection: (section: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  scrollToInput: () => void;
}

export function useHomeController(): HomeController {
  const { theme, toggleTheme } = useTheme();
  const { currentLang, supportedLanguages, t, switchLang } = useLanguage();

  // L-003: 动态更新 html lang 属性（语言切换时同步）
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // 显示提示（useCallback 稳定引用，避免下游 hook 依赖链抖动触发重渲染）
  const showToast = useCallback((key: string, params?: Record<string, string | number>) => {
    const toastMessages = t.toast as Record<string, string>;
    let message = toastMessages[key] || key;
    // 缺翻译键时告警，便于发现漏翻（不影响功能，回退显示原始 key）
    if (!toastMessages[key]) {
      logger.warn(`[i18n] 缺少 toast 翻译键: "${key}"（语言 ${currentLang}），已回退为原始 key`);
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        message = message.replace(`{${k}}`, String(v));
      });
    }
    toast(message);
  }, [t, currentLang]);

  // 域名数据管理
  const {
    sourceInput,
    parsedData,
    stats,
    setStats,
    lineNumbersRef,
    clearAll,
    sortDomains,
    dedupeDomains,
    handleSourceInput,
    setSourceInput,
    parseSourceData,
  } = useDomainData(showToast);

  // 设置管理
  const { settings, setSettings, updateSettings } = useSettings();

  // 稳定引用：将「生效后统计」合并进展示用的 stats（保留 domainCount/commentCount/invalidCount）。
  // 用 useCallback 包裹，避免每次渲染生成新函数导致 useRules 的 runGenerate 及下游回调
  // （generateRules 等）身份抖动，进而破坏 OutputPanel(React.memo) 的跳过重渲染优化。
  const handleEffectiveStats = useCallback(
    (partial: Pick<Stats, 'blacklistCount' | 'whitelistCount' | 'validCount'>) =>
      setStats((prev) => ({ ...prev, ...partial })),
    [setStats]
  );

  // 规则生成
  const {
    outputContent,
    currentFormat,
    outputPreviewRef,
    outputLineNumbersRef,
    generateRules,
    downloadOutput,
    copyOutput,
    setFormat,
    syncOutputScroll,
  } = useRules(parsedData, sourceInput, settings, t, showToast, parseSourceData, handleEffectiveStats);

  // URL管理
  const {
    urls,
    isLoading,
    activePreset,
    urlInput,
    setUrlInput,
    loadPreset,
    fetchFromUrl,
    addUrl,
    sortUrls,
    fetchAllUrls,
    setUrls,
  } = useUrlManager(setSourceInput, parseSourceData, showToast, lineNumbersRef);

  // 区域折叠状态
  const [isUrlSectionCollapsed, setIsUrlSectionCollapsed] = useState(true);
  // 设置面板弹窗开关（对齐原型 settings-modal：L2 由侧栏折叠改为居中弹窗）
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 使用指南弹窗开关（对齐原型 #guideModal：页脚 linkGuide 触发）
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const openGuide = useCallback(() => setIsGuideOpen(true), [setIsGuideOpen]);

  // 引用
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步滚动（仅用 ref，依赖为空，useCallback 稳定引用）
  const syncScroll = useCallback(() => {
    if (sourceTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = sourceTextareaRef.current.scrollTop;
    }
  }, [sourceTextareaRef, lineNumbersRef]);

  // 切换区域（函数式 setState 使依赖为空，useCallback 稳定引用，避免下游重渲染）
  const toggleSection = useCallback((section: string) => {
    if (section === 'url-section') {
      setIsUrlSectionCollapsed(prev => !prev);
    }
  }, []);

  // 设置面板弹窗开关（对齐原型 settings-modal）
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  // Hero CTA：滚动到输入面板并聚焦编辑器
  const scrollToInput = useCallback(() => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('input-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const editor = document.getElementById('source-editor');
        (editor as HTMLTextAreaElement | null)?.focus?.();
      }
    }
  }, []);

  return {
    theme,
    toggleTheme,
    currentLang,
    supportedLanguages,
    t,
    switchLang,
    sourceInput,
    parsedData,
    stats,
    setStats,
    lineNumbersRef,
    clearAll,
    sortDomains,
    dedupeDomains,
    handleSourceInput,
    setSourceInput,
    parseSourceData,
    showToast,
    settings,
    setSettings,
    updateSettings,
    outputContent,
    currentFormat,
    outputPreviewRef,
    outputLineNumbersRef,
    generateRules,
    downloadOutput,
    copyOutput,
    setFormat,
    syncOutputScroll,
    urls,
    isLoading,
    activePreset,
    urlInput,
    setUrlInput,
    loadPreset,
    fetchFromUrl,
    addUrl,
    sortUrls,
    fetchAllUrls,
    setUrls,
    isUrlSectionCollapsed,
    setIsUrlSectionCollapsed,
    isSettingsOpen,
    setIsSettingsOpen,
    isGuideOpen,
    setIsGuideOpen,
    openGuide,
    sourceTextareaRef,
    syncScroll,
    toggleSection,
    openSettings,
    closeSettings,
    scrollToInput,
  };
}
