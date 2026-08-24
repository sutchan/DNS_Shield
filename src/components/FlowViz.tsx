// src/components/FlowViz.tsx v3.8.8
// 输出流量可视化签名组件：对齐原型 flowviz —— 三态管道（拦截/放行/改道）
// 实时反映 parsedData 中黑名单/白名单/自定义 DNS 的真实占比，域名 token 从管道顶部落入。
// 动画遵循全局 prefers-reduced-motion 降级（globals.css 已统一处理）。
'use client';
import * as React from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import { ParsedData } from '../types';
import { useT } from '../context/AppContext';
import { Button } from './ui/Button';

/** 单条轨道的静态 token 数量（视觉密度，不随数据量无限增长） */
const TOKENS_PER_PIPE = 7;

interface PipeProps {
  kind: 'block' | 'allow' | 'dns';
  count: number;
  label: string;
}

/** 单条垂直管道：顶部信号点 + 落入的域名 token + 底部实时计数 */
const Pipe: React.FC<PipeProps> = ({ kind, count, label }) => (
  <div className={`fv-pipe fv-pipe-${kind}`} role="group" aria-label={label}>
    <span className="fv-signal" aria-hidden="true" />
    <div className="fv-track" aria-hidden="true">
      {Array.from({ length: TOKENS_PER_PIPE }).map((_, i) => (
        <span
          key={i}
          className="fv-token"
          style={{ animationDelay: `${(i * 0.9).toFixed(2)}s` }}
        />
      ))}
    </div>
    <span className="fv-count" aria-hidden="true">{count}</span>
  </div>
);

interface FlowVizProps {
  parsedData: ParsedData;
  // Hero CTA 回调（对齐原型 ctaStart / ctaSettings）
  onStart?: () => void;
  onToggleSettings?: () => void;
}

/** 流量可视化签名区：将当前输入的三类域名以三态管道动画呈现 */
const FlowViz: React.FC<FlowVizProps> = ({ parsedData, onStart, onToggleSettings }) => {
  const t = useT();
  const block = parsedData.domains.length;
  const allow = parsedData.whitelist.length;
  const dns = parsedData.customDns.length;
  const total = block + allow + dns;

  const legend = [
    { kind: 'block', text: t.fvBlock },
    { kind: 'allow', text: t.fvAllow },
    { kind: 'dns', text: t.fvDns },
    { kind: 'await', text: t.fvAwait },
  ] as const;

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
          <ul className="fv-legend" id="flowviz-legend">
            {legend.map((item) => (
              <li key={item.kind} className={`fv-legend-item fv-legend-${item.kind}`}>
                <span className="fv-legend-dot" aria-hidden="true" />
                <span className="fv-legend-text">{item.text}</span>
              </li>
            ))}
          </ul>
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
            {/* Hero CTA（对齐原型 ctaStart / ctaSettings） */}
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

        <div className="flowviz" id="flowviz" aria-hidden="true">
          <div className="fv-pipes">
            <Pipe kind="block" count={block} label={t.fvBlock} />
            <Pipe kind="allow" count={allow} label={t.fvAllow} />
            <Pipe kind="dns" count={dns} label={t.fvDns} />
          </div>
          <p className="fv-summary">
            {total > 0
              ? `${total} ${t.fvDomains}`
              : t.fvAwait}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FlowViz;
