// src/components/FlowViz.tsx v3.15.0
// 首屏签名区：左侧文案 + 右侧数据快照面板。
// v3.13.5 起移除 token 下落动画（useFlowTokens 定时器驱动的持续重渲染已删除），
// 改为按三态比例确定性抽样的静态徽章面板——零动画、零定时器、零运行时开销。
'use client';
import * as React from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import { ParsedData } from '../types';
import { useT } from '../context/AppContext';
import { buildFlowPool, FlowPoolItem } from '../utils/buildFlowPool';
import { Button } from './ui/Button';

interface FlowVizProps {
  parsedData: ParsedData;
  // Hero CTA 回调（对齐原型 ctaStart / ctaSettings）
  onStart?: () => void;
  onToggleSettings?: () => void;
}

// 静态快照抽样上限：黑名单 4 / 白名单 2 / 改道 2，交错排列保持三态可读性。
const SNAPSHOT_LIMITS: Record<FlowPoolItem['kind'], number> = {
  block: 4,
  allow: 2,
  dns: 2,
};

/** 按三态比例确定性抽样（不随机、不随时间变化），供静态徽章陈列。 */
function buildSnapshot(parsedData: ParsedData): FlowPoolItem[] {
  const pool = buildFlowPool(parsedData);
  const byKind = (kind: FlowPoolItem['kind']) =>
    pool.filter((item) => item.kind === kind).slice(0, SNAPSHOT_LIMITS[kind]);
  const groups = [byKind('block'), byKind('allow'), byKind('dns')];
  const max = groups.reduce((acc, g) => Math.max(acc, g.length), 0);
  const out: FlowPoolItem[] = [];
  for (let i = 0; i < max; i += 1) {
    for (const group of groups) {
      const item = group[i];
      if (item) out.push(item);
    }
  }
  return out;
}

/** 首屏签名区：左侧文案 + 右侧数据快照面板 */
const FlowViz: React.FC<FlowVizProps> = React.memo(function FlowViz({ parsedData, onStart, onToggleSettings }) {
  const t = useT();
  const snapshot = React.useMemo(() => buildSnapshot(parsedData), [parsedData]);
  const block = parsedData.domains.length;
  const allow = parsedData.whitelist.length;
  const dns = parsedData.customDns.length;
  const hasData = block > 0 || allow > 0 || dns > 0;

  return (
    <section className="hero" id="hero" aria-label={t.fvTagline}>
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

        <div className="flowviz" id="flowviz" aria-label={t.fvTagline}>
          <div className="flowviz-row fv-summary" id="fv-summary">
            <span className="fv-dot block" aria-hidden="true" />
            <span className="fv-name" id="fv-summary-txt">
              {hasData
                ? `${block} ${t.fvBlock} / ${allow} ${t.fvAllow} / ${dns} ${t.fvDns}`
                : t.fvAwait}
            </span>
          </div>
          <div className="fv-panel" id="fv-track" aria-hidden="true">
            {hasData ? (
              snapshot.map((item) => (
                <span key={`${item.kind}-${item.name}`} className={`fv-chip ${item.kind}`}>
                  {item.name}
                </span>
              ))
            ) : (
              <span className="fv-empty">{t.fvAwait}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default FlowViz;
