// src/hooks/useHomeUiState.ts v3.13.6
// 首页本地 UI 状态编排（从 useHomeController 抽离）：区域折叠 / 设置弹窗 / 指南弹窗
// 的开关、编辑器滚动同步、滚动到输入区并聚焦。与领域数据/规则生成解耦，单一职责。
import { useState, useRef, useCallback } from 'react';

export function useHomeUiState(lineNumbersRef: React.RefObject<HTMLDivElement>) {
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
