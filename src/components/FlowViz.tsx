// src/components/FlowViz.tsx v3.8.1
// 输出流量可视化签名组件：对齐原型 flowviz —— 三态管道（拦截/放行/改道）
// 实时反映 parsedData 中黑名单/白名单/自定义 DNS 的真实占比，域名 token 从管道顶部落入。
// 动画遵循全局 prefers-reduced-motion 降级（globals.css 已统一处理）。
'use client';
import * as React from 'react';
import { ParsedData } from '../types';
import { useT } from '../context/AppContext';

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
}

/** 流量可视化签名区：将当前输入的三类域名以三态管道动画呈现 */
const FlowViz: React.FC<FlowVizProps> = ({ parsedData }) => {
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
          <p className="hero-tagline" id="hero-tagline">{t.fvTagline}</p>
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
                  <span className="step-title">{t.usageStep1}</span>
                  <span className="step-desc">{t.usageStep1Desc}</span>
                </div>
              </div>
              <div className="usage-step">
                <span className="step-number" aria-hidden="true">2</span>
                <div className="step-content">
                  <span className="step-title">{t.usageStep2}</span>
                  <span className="step-desc">{t.usageStep2Desc}</span>
                </div>
              </div>
              <div className="usage-step">
                <span className="step-number" aria-hidden="true">3</span>
                <div className="step-content">
                  <span className="step-title">{t.usageStep3}</span>
                  <span className="step-desc">{t.usageStep3Desc}</span>
                </div>
              </div>
            </div>
            <div className="usage-tip">
              <span className="tip-label">{t.usageTip}</span>
              <span className="tip-content">{t.usageTipContent}</span>
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
