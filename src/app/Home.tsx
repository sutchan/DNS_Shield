// src/app/Home.tsx v3.22.0
// 首页编排：仅负责组合布局与渲染，所有状态逻辑已抽离至 useHomeController（保持主文件 ≤200 行）。
// 全局样式统一由 app/layout.tsx 导入（含拆分后的 src/styles/*.css），此处不再重复导入。
// v3.19.1：GuideModal 改 next/dynamic 懒加载，移出首屏 bundle（默认关闭、按需下载）。
// v3.20.0：站点事实文本（关于 / FAQ 等）迁至 /about/ 独立页，首页只保留工具本体。
'use client';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import FlowViz from '../components/FlowViz';
import Footer from '../components/Footer';
const GuideModal = dynamic(() => import('../components/GuideModal'), { ssr: false });
import { ToastProvider } from '../components/ui/Toast';
import { AppProvider } from '../context/AppContext';
import { useHomeController } from '../hooks/useHomeController';
import ServiceWorkerRegistrar from '../components/ServiceWorkerRegistrar';

export default function Home() {
  const c = useHomeController();
  // T-AUD-M12：每次渲染新建 value 会让 13 个 useT() 消费者全量重渲染
  const appValue = useMemo(() => ({ t: c.t }), [c.t]);

  return (
    <AppProvider value={appValue}>
      <ServiceWorkerRegistrar />
      <div className="container" id="app-container">
        <Header onOpenSettings={c.openSettings} />

        <FlowViz
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
            categoryAvailable={c.categoryAvailable}
            categoryIndex={c.categoryIndex}
            selectedCategories={c.selectedCategories}
            onToggleCategory={c.onToggleCategory}
            onClearCategories={c.onClearCategories}
          />

          <OutputPanel
            currentOutput={c.currentOutput}
            currentFormat={c.currentFormat}
            isSettingsOpen={c.isSettingsOpen}
            onCloseSettings={c.closeSettings}
            settings={c.settings}
            parsedData={c.parsedData}
            effectiveData={c.filteredData}
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
            currentLang={c.currentLang}
            supportedLanguages={c.supportedLanguages}
            switchLang={c.switchLang}
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
