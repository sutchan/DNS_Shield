// src/app/Home.tsx v3.1.0
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

// 导入钩子
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useDomainData } from '../hooks/useDomainData';
import { useRules } from '../hooks/useRules';
import { useUrlManager } from '../hooks/useUrlManager';
import { toast } from 'sonner';

// 导入类型
import { Settings } from '../types';

export default function Home() {
  // 使用钩子
  const { theme, toggleTheme } = useTheme();
  const { currentLang, supportedLanguages, t, isLangZh, switchLang } = useLanguage();

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
  const [settings, setSettings] = useState<Settings>({
    projectName: 'DNS Shield',
    version: '3.1.0',
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
  });

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
  } = useRules(parsedData, settings, t, showToast);

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
  } = useUrlManager(setSourceInput, parseSourceData, showToast, lineNumbersRef, isLangZh);

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

  // 更新设置
  const updateSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev: Settings) => ({
      ...prev,
      [id.replace('Input', '')]: value
    }));
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
    <div className="container" id="app-container">
      <Header
        theme={theme}
        currentLang={currentLang}
        supportedLanguages={supportedLanguages}
        t={t}
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
          t={t}
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
          t={t}
          isLangZh={isLangZh}
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

      <Footer 
        t={t}
        version={settings.version}
      />

      <Loading isLoading={isLoading} isLangZh={isLangZh} />
      <ToastProvider />
    </div>
  );
}
