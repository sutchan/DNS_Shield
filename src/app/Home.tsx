// src/app/Home.tsx v3.7.16
'use client';
import React, { useState, useRef, useEffect } from 'react';
import './globals.css';

// 导入组件
import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import Footer from '../components/Footer';
import { ToastProvider } from '../components/ui/Toast';
import Loading from '../components/ui/Loading';
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
  
  // 显示提示
  const showToast = (key: string, params?: Record<string, string | number>) => {
    const toastMessages = t.toast as Record<string, string>;
    let message = toastMessages[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        message = message.replace(`{${k}}`, String(v));
      });
    }
    toast(message);
  };

  // 域名数据管理
  const { 
    sourceInput, 
    parsedData, 
    stats, 
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
  } = useRules(parsedData, sourceInput, settings, t, showToast, parseSourceData);

  // URL管理
  const { 
    urls, 
    isLoading, 
    activePreset, 
    urlInputRef, 
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

  // 引用
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步滚动
  const syncScroll = () => {
    if (sourceTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = sourceTextareaRef.current.scrollTop;
    }
  };

  // 切换区域
  const toggleSection = (section: string) => {
    switch (section) {
      case 'url-section':
        setIsUrlSectionCollapsed(!isUrlSectionCollapsed);
        break;
      case 'settings-panel':
        setIsSettingsPanelCollapsed(!isSettingsPanelCollapsed);
        break;
    }
  };

  // 解析域名
  const parseSource = () => {
    parseSourceData();
  };

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

        <main className="main-content">
          <InputPanel
            sourceInput={sourceInput}
            urls={urls}
            isUrlSectionCollapsed={isUrlSectionCollapsed}
            stats={stats}
            activePreset={activePreset}
            lineNumbersRef={lineNumbersRef}
            sourceTextareaRef={sourceTextareaRef}
            urlInputRef={urlInputRef}
            toggleSection={toggleSection}
            handleSourceInput={handleSourceInput}
            syncScroll={syncScroll}
            clearAll={clearAll}
            sortDomains={sortDomains}
            parseSource={parseSource}
            dedupeDomains={dedupeDomains}
            saveDomains={saveDomains}
            loadPreset={loadPreset}
            fetchFromUrl={fetchFromUrl}
            addUrl={addUrl}
            sortUrls={sortUrls}
            fetchAllUrls={fetchAllUrls}
            setUrls={setUrls}
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
          />
        </main>

        <Footer version={settings.version} />

        <Loading isLoading={isLoading} loadingText={t.toast.loading} />
        <ToastProvider />
      </div>
    </AppProvider>
  );
}
