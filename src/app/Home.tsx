// src/app/Home.tsx v3.11.1
// 首页编排：仅负责组合布局与渲染，所有状态逻辑已抽离至 useHomeController（保持主文件 ≤200 行）。
'use client';
import './globals.css';

import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import FlowViz from '../components/FlowViz';
import Footer from '../components/Footer';
import GuideModal from '../components/GuideModal';
import { ToastProvider } from '../components/ui/Toast';
import { AppProvider } from '../context/AppContext';
import { useHomeController } from '../hooks/useHomeController';

export default function Home() {
  const c = useHomeController();

  return (
    <AppProvider value={{ t: c.t }}>
      <div className="container" id="app-container">
        <Header
          currentLang={c.currentLang}
          supportedLanguages={c.supportedLanguages}
          switchLang={c.switchLang}
          onOpenSettings={c.openSettings}
        />

        <FlowViz
          parsedData={c.parsedData}
          onStart={c.scrollToInput}
          onToggleSettings={c.openSettings}
        />

        <main className="main-content" id="main-content">
          <InputPanel
            sourceInput={c.sourceInput}
            urls={c.urls}
            isUrlSectionCollapsed={c.isUrlSectionCollapsed}
            stats={c.stats}
            activePreset={c.activePreset}
            lineNumbersRef={c.lineNumbersRef}
            sourceTextareaRef={c.sourceTextareaRef}
            urlInput={c.urlInput}
            setUrlInput={c.setUrlInput}
            toggleSection={c.toggleSection}
            handleSourceInput={c.handleSourceInput}
            syncScroll={c.syncScroll}
            clearAll={c.clearAll}
            sortDomains={c.sortDomains}
            generateRules={c.generateRules}
            dedupeDomains={c.dedupeDomains}
            loadPreset={c.loadPreset}
            fetchFromUrl={c.fetchFromUrl}
            addUrl={c.addUrl}
            sortUrls={c.sortUrls}
            fetchAllUrls={c.fetchAllUrls}
            setUrls={c.setUrls}
            isLoading={c.isLoading}
            progress={c.progress}
            isProcessing={c.isProcessing}
          />

          <OutputPanel
            outputContent={c.outputContent}
            currentFormat={c.currentFormat}
            isSettingsOpen={c.isSettingsOpen}
            onOpenSettings={c.openSettings}
            onCloseSettings={c.closeSettings}
            settings={c.settings}
            parsedData={c.parsedData}
            outputPreviewRef={c.outputPreviewRef}
            outputLineNumbersRef={c.outputLineNumbersRef}
            setFormat={c.setFormat}
            generateRules={c.generateRules}
            downloadOutput={c.downloadOutput}
            copyOutput={c.copyOutput}
            syncOutputScroll={c.syncOutputScroll}
            setSettings={c.setSettings}
            theme={c.theme}
            toggleTheme={c.toggleTheme}
            showToast={c.showToast}
          />
        </main>

        <Footer onOpenGuide={c.openGuide} />

        <GuideModal open={c.isGuideOpen} onClose={() => c.setIsGuideOpen(false)} />

        <ToastProvider />
      </div>
    </AppProvider>
  );
}
