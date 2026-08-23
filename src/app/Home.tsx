// src/app/Home.tsx v3.8.4
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './globals.css';

// 导入组件
import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import FlowViz from '../components/FlowViz';
import Footer from '../components/Footer';
import GuideModal from '../components/GuideModal';
import { ToastProvider } from '../components/ui/Toast';
import { AppProvider } from '../context/AppContext';

// 导入钩子
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useDomainData } from '../hooks/useDomainData';
import { useRules } from '../hooks/useRules';
import { useUrlManager } from '../hooks/useUrlManager';
import { useSettings } from '../hooks/useSettings';
import { toast } from 'sonner';

export default function Home() {
  // 使用钩子
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
      console.warn(`[i18n] 缺少 toast 翻译键: "${key}"（语言 ${currentLang}），已回退为原始 key`);
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
    saveDomains, 
    handleSourceInput,
    setSourceInput,
    parseSourceData
  } = useDomainData(showToast);

  // 设置管理
  const { settings, setSettings, updateSettings } = useSettings();

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
    syncOutputScroll
  } = useRules(parsedData, sourceInput, settings, t, showToast, parseSourceData,
    // 将「生效后统计」合并进展示用的 stats（保留 domainCount/commentCount/invalidCount）
    (partial) => setStats((prev) => ({ ...prev, ...partial }))
  );

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
    setUrls
  } = useUrlManager(setSourceInput, parseSourceData, showToast, lineNumbersRef);

  // 区域折叠状态
  const [isUrlSectionCollapsed, setIsUrlSectionCollapsed] = useState(true);
  const [isSettingsPanelCollapsed, setIsSettingsPanelCollapsed] = useState(true);

  // 使用指南弹窗开关（对齐原型 #guideModal：页脚 linkGuide 触发）
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 引用
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步滚动（仅用 ref，依赖为空，useCallback 稳定引用）
  const syncScroll = useCallback(() => {
    if (sourceTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = sourceTextareaRef.current.scrollTop;
    }
  }, []);

  // 切换区域（函数式 setState 使依赖为空，useCallback 稳定引用，避免下游重渲染）
  const toggleSection = useCallback((section: string) => {
    switch (section) {
      case 'url-section':
        setIsUrlSectionCollapsed(prev => !prev);
        break;
      case 'settings-panel':
        setIsSettingsPanelCollapsed(prev => !prev);
        break;
    }
  }, []);

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

  return (
    <AppProvider value={{ t }}>
      <div className="container" id="app-container">
        <Header
          theme={theme}
          currentLang={currentLang}
          supportedLanguages={supportedLanguages}
          toggleTheme={toggleTheme}
          switchLang={switchLang}
        />

        <FlowViz
          parsedData={parsedData}
          onStart={scrollToInput}
          onToggleSettings={() => toggleSection('settings-panel')}
        />

        <main className="main-content" id="main-content">
          <InputPanel
            sourceInput={sourceInput}
            urls={urls}
            isUrlSectionCollapsed={isUrlSectionCollapsed}
            stats={stats}
            activePreset={activePreset}
            lineNumbersRef={lineNumbersRef}
            sourceTextareaRef={sourceTextareaRef}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            toggleSection={toggleSection}
            handleSourceInput={handleSourceInput}
            syncScroll={syncScroll}
            clearAll={clearAll}
            sortDomains={sortDomains}
            parseSource={parseSourceData}
            dedupeDomains={dedupeDomains}
            saveDomains={saveDomains}
            loadPreset={loadPreset}
            fetchFromUrl={fetchFromUrl}
            addUrl={addUrl}
            sortUrls={sortUrls}
            fetchAllUrls={fetchAllUrls}
            setUrls={setUrls}
            isLoading={isLoading}
          />

          <OutputPanel
            outputContent={outputContent}
            currentFormat={currentFormat}
            isSettingsPanelCollapsed={isSettingsPanelCollapsed}
            settings={settings}
            parsedData={parsedData}
            outputPreviewRef={outputPreviewRef}
            outputLineNumbersRef={outputLineNumbersRef}
            toggleSection={toggleSection}
            setFormat={setFormat}
            generateRules={generateRules}
            downloadOutput={downloadOutput}
            copyOutput={copyOutput}
            syncOutputScroll={syncOutputScroll}
            updateSettings={updateSettings}
            setSettings={setSettings}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </main>

        <Footer onOpenGuide={() => setIsGuideOpen(true)} />

        <GuideModal open={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

        <ToastProvider />
      </div>
    </AppProvider>
  );
}




