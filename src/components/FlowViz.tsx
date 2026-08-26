// src/components/FlowViz.tsx v3.9.8
// DNS 流量可视化签名区：对齐原型 flowviz —— 单条横向流量管道，真实域名 token 下落。
// token 从解析后的黑名单/白名单/改道数据中随机抽样，按三态比例落入轨道。
// 动画遵循全局 prefers-reduced-motion 降级（globals.css 已统一处理）。
'use client';
import * as React from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import { ParsedData } from '../types';
import { useT } from '../context/AppContext';
import { useFlowTokens } from '../hooks/useFlowTokens';
import { Button } from './ui/Button';

interface FlowVizProps {
  parsedData: ParsedData;
  // Hero CTA 回调（对齐原型 ctaStart / ctaSettings）
  onStart?: () => void;
  onToggleSettings?: () => void;
}

/** 流量可视化签名区：左侧文案 + 右侧实时流量轨道 */
const FlowViz: React.FC<FlowVizProps> = React.memo(function FlowViz({ parsedData, onStart, onToggleSettings }) {
  const t = useT();
  const tokens = useFlowTokens(parsedData);
  const block = parsedData.domains.length;
  const allow = parsedData.whitelist.length;
  const dns = parsedData.customDns.length;
  const hasData = block > 0 || allow > 0 || dns > 0;

  return (
    <section className="hero" id="hero" aria-label={t.fvTagline}>
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker" id="heroKicker">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" /></svg>
            <span id="heroKickerTxt">{t.heroKicker}</span>
          </span>
          <h1 className="hero-title" id="heroTitle">{t.heroTitle}</h1>
          <p className="hero-desc" id="heroDesc">{t.heroDesc}</p>

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

            <div className="hero-cta" id="heroCta">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onStart}
                id="ctaStart"
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
                id="ctaSettings"
              >
                <Settings2 className="h-4 w-4 mr-1" strokeWidth={1.8} aria-hidden="true" />
                {t.ctaSettings}
              </Button>
            </div>
          </div>
        </div>

        <div className="flowviz" id="flowviz" aria-label={t.fvTagline}>
          <div className="flowviz-row fv-summary" id="fvSummary">
            <span className="fv-dot block" aria-hidden="true" />
            <span className="fv-name" id="fvSummaryTxt">
              {hasData
                ? `${block} ${t.fvBlock} / ${allow} ${t.fvAllow} / ${dns} ${t.fvDns}`
                : t.fvAwait}
            </span>
          </div>
          <div className="fv-track" id="fvTrack" aria-hidden="true">
            {tokens.map((token) => (
              <span
                key={token.id}
                className={`fv-token ${token.kind}`}
                style={{ left: token.left, animationDuration: token.duration }}
              >
                {token.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default FlowViz;
