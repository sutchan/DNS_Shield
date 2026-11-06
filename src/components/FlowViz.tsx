// src/components/FlowViz.tsx v3.15.2
// 首屏 Hero 区：左侧文案 + 快速入门 + CTA。
// v3.15.2 移除右侧「黑名单/白名单」可视化窗口（原 flowviz 数据面板），
// 首屏回归单栏信息布局，降低视觉噪音与无关数据干扰。
'use client';
import * as React from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import { useT } from '../context/AppContext';
import { Button } from './ui/Button';

interface FlowVizProps {
  // Hero CTA 回调（对齐原型 ctaStart / ctaSettings）
  onStart?: () => void;
  onToggleSettings?: () => void;
}

/** 首屏 Hero 区：文案 + 快速入门 + CTA（不含数据可视化面板） */
const FlowViz: React.FC<FlowVizProps> = React.memo(function FlowViz({ onStart, onToggleSettings }) {
  const t = useT();

  return (
    <section className="hero" id="hero" aria-label={t.heroTitle}>
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker" id="hero-kicker">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" /></svg>
            <span id="hero-kicker-txt">{t.heroKicker}</span>
          </span>
          <h1 className="hero-title" id="hero-title">{t.heroTitle}</h1>
          <p className="hero-desc" id="hero-desc">{t.heroDesc}</p>

          <div className="usage-guide quickstart" id="quickstart-panel" aria-label={t.usageTitle}>
            <h3 className="usage-guide-title">{t.usageTitle}</h3>
            <div className="usage-steps">
              <div className="usage-step">
                <span className="step-number" aria-hidden="true">1</span>
                <div className="step-content">
                  <span className="step-title">{t.step1t}</span>
                  <span className="step-desc">{t.step1d}</span>
                </div>
              </div>
              <div className="usage-step">
                <span className="step-number" aria-hidden="true">2</span>
                <div className="step-content">
                  <span className="step-title">{t.step2t}</span>
                  <span className="step-desc">{t.step2d}</span>
                </div>
              </div>
              <div className="usage-step">
                <span className="step-number" aria-hidden="true">3</span>
                <div className="step-content">
                  <span className="step-title">{t.step3t}</span>
                  <span className="step-desc">{t.step3d}</span>
                </div>
              </div>
            </div>

            <div className="hero-cta" id="hero-cta">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onStart}
                id="cta-start"
                className="font-semibold"
              >
                <Sparkles className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
                {t.ctaStart}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleSettings}
                id="cta-settings"
              >
                <Settings2 className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
                {t.ctaSettings}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FlowViz;
