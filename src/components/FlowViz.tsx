// src/components/FlowViz.tsx v3.19.0
// 首屏 Hero 区：信息布局（kicker / 标题 / 描述 / CTA + 快速入门三步）。
// v3.15.2 移除右侧「黑名单/白名单」可视化窗口，首屏回归单栏；
// v3.15.6 UI 优化：CTA 上移至描述下方更醒目；快速入门三步改为通栏卡片并以分隔线与正文区分。
// v3.16.1 布局优化：lg+ 改为「左文案 + 右快速入门」双栏消除大屏右侧留白，
//   快速入门在大屏竖排并以左分隔线与文案区隔；CTA 按钮升级 default 尺寸。
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

/** 快速入门步骤：点击后滚动并聚焦对应控件，让静态引导真正可操作（T-UI-08） */
const focusTarget = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
};

/** 首屏 Hero 区：文案 + CTA + 快速入门（不含数据可视化面板） */
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

          <div className="hero-cta" id="hero-cta">
            <Button
              type="button"
              variant="default"
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
              onClick={onToggleSettings}
              id="cta-settings"
            >
              <Settings2 className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
              {t.ctaSettings}
            </Button>
          </div>
        </div>

        <div className="quickstart" id="quickstart-panel" aria-label={t.usageTitle}>
          <h3 className="usage-guide-title">{t.usageTitle}</h3>
          <div className="usage-steps">
            <a
              className="usage-step"
              href="#source-editor"
              onClick={(e) => { e.preventDefault(); focusTarget('source-editor'); }}
            >
              <span className="step-number" aria-hidden="true">1</span>
              <div className="step-content">
                <span className="step-title">{t.step1t}</span>
                <span className="step-desc">{t.step1d}</span>
              </div>
            </a>
            <a
              className="usage-step"
              href="#output-format-select-btn"
              onClick={(e) => { e.preventDefault(); focusTarget('output-format-select-btn'); }}
            >
              <span className="step-number" aria-hidden="true">2</span>
              <div className="step-content">
                <span className="step-title">{t.step2t}</span>
                <span className="step-desc">{t.step2d}</span>
              </div>
            </a>
            <a
              className="usage-step"
              href="#download-btn"
              onClick={(e) => { e.preventDefault(); focusTarget('download-btn'); }}
            >
              <span className="step-number" aria-hidden="true">3</span>
              <div className="step-content">
                <span className="step-title">{t.step3t}</span>
                <span className="step-desc">{t.step3d}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FlowViz;
