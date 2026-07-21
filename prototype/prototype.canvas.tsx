// DNS Shield 高保真原型 v3.6.0
// 设计规范：Swiss Modernism 2.0 × Apple Precision
// 严格遵循 DNS Shield Design System v3.6.0
import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const MOCK_DOMAINS = `# === 白名单 ===
+idm.iot.mi.com
+api.io.mi.com

# === 小米 ===
bss.pandora.xiaomi.com
jellyfish.pandora.xiaomi.com
ad.mi.com
ad.xiaomi.com

# === 视频平台 ===
ad.iqiyi.com
log.iqiyi.com
ad.youku.com
ad.bilibili.com
log.bilibili.com`;

const OUTPUT_SAMPLES: Record<string, string> = {
  dnsmasq: `# DNS Shield - Dnsmasq 广告过滤列表
# 版本: 3.6.0 | 域名: 6 个

address=/ad.mi.com/127.0.0.1
address=/ad.xiaomi.com/127.0.0.1
address=/ad.iqiyi.com/127.0.0.1
address=/log.iqiyi.com/127.0.0.1
address=/ad.youku.com/127.0.0.1
address=/ad.bilibili.com/127.0.0.1

# 白名单
server=/mi.com/
server=/iot.mi.com/`,
  hosts: `# DNS Shield - Hosts 广告过滤列表
# 版本: 3.6.0

127.0.0.1 ad.mi.com
127.0.0.1 ad.xiaomi.com
127.0.0.1 ad.iqiyi.com
127.0.0.1 log.iqiyi.com
127.0.0.1 ad.youku.com
127.0.0.1 ad.bilibili.com`,
  adguard: `! DNS Shield - AdGuard 广告过滤规则
! 版本: 3.6.0 | 域名: 6 个

||ad.mi.com^
||ad.xiaomi.com^
||ad.iqiyi.com^
||log.iqiyi.com^
||ad.youku.com^
||ad.bilibili.com^

! 白名单
@@||mi.com^
@@||iot.mi.com^`,
  whitelist: `# DNS Shield - 白名单列表
@@||mi.com^
@@||iot.mi.com^`
};

type Theme = 'light' | 'dark';
type FormatType = 'dnsmasq' | 'hosts' | 'adguard' | 'whitelist';

/* ============================================
   Icons — Lucide-style SVG
   ============================================ */
const Icons = {
  Shield: ({ className }: { className?: string }) => (
    <svg className={cn('w-[22px] h-[22px]', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  FileInput: ({ className }: { className?: string }) => (
    <svg className={cn('w-[18px] h-[18px]', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Play: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  RotateCw: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Download: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Copy: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Moon: ({ className }: { className?: string }) => (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Sun: ({ className }: { className?: string }) => (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Code: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  Terminal: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  Grid: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    </svg>
  ),
  ShieldCheck: ({ className }: { className?: string }) => (
    <svg className={cn('w-3.5 h-3.5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={cn('w-3 h-3', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg className={cn('w-12 h-12', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

/* ============================================
   Sub-components
   ============================================ */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 min-w-[68px] rounded-md bg-muted/60 text-center">
      <span className="text-sm font-semibold leading-none tracking-tight text-foreground">{value}</span>
      <span className="text-[0.6875rem] text-muted-foreground leading-none mt-0.5">{label}</span>
    </div>
  );
}

function CodeEditor({ value, readOnly, onChange }: { value: string; readOnly?: boolean; onChange?: (v: string) => void }) {
  const lineCount = value ? value.split('\n').length : 1;
  const gutterLines = Array.from({ length: lineCount }, (_, i) => i + 1);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative flex rounded-lg border border-border overflow-hidden">
      <div
        ref={lineNumbersRef}
        className="w-10 py-3 pr-2 text-right text-xs text-muted-foreground/60 select-none bg-muted/30 font-mono overflow-hidden border-r border-border"
        aria-hidden="true"
      >
        {gutterLines.map((num) => (
          <div key={num} className="leading-6">{num}</div>
        ))}
      </div>
      {readOnly ? (
        <pre className="flex-1 min-h-[240px] p-3 text-[13px] leading-6 font-mono bg-background m-0 overflow-auto whitespace-pre-wrap word-break-break-all">
          {value}
        </pre>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          className="flex-1 min-h-[240px] p-3 text-[13px] leading-6 font-mono bg-background resize-y focus:outline-none"
          aria-label="域名编辑器"
        />
      )}
    </div>
  );
}

function FormatTabs({ current, onChange }: { current: FormatType; onChange: (f: FormatType) => void }) {
  const formats: { key: FormatType; label: string; icon: React.ReactNode }[] = [
    { key: 'dnsmasq', label: 'Dnsmasq', icon: <Icons.Terminal /> },
    { key: 'hosts', label: 'Hosts', icon: <Icons.Grid /> },
    { key: 'adguard', label: 'AdGuard', icon: <Icons.ShieldCheck /> },
    { key: 'whitelist', label: '白名单', icon: <Icons.Check /> },
  ];

  return (
    <div className="inline-flex p-0.5 rounded-lg bg-muted gap-0.5" role="tablist">
      {formats.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          role="tab"
          aria-selected={current === f.key}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1.5 text-[0.8125rem] font-medium rounded-md transition-all duration-150 whitespace-nowrap',
            current === f.key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {f.icon}
          {f.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ============================================
   Main Component
   ============================================ */
export default function PrototypeCanvas() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [format, setFormat] = useState<FormatType>('dnsmasq');
  const [showData, setShowData] = useState(true);
  const [inputValue, setInputValue] = useState(MOCK_DOMAINS);
  const isDark = theme === 'dark';

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const toggleData = useCallback(() => {
    setShowData(prev => !prev);
    if (showData) setInputValue('');
    else setInputValue(MOCK_DOMAINS);
  }, [showData]);

  return (
    <div className={cn('min-h-dvh flex flex-col transition-colors duration-300', isDark ? 'dark' : '')}>
      <div className="min-h-dvh flex flex-col bg-background text-foreground font-sans antialiased">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border backdrop-blur-md bg-background/90 transition-colors duration-300">
          <div className="flex items-center justify-between h-12 max-w-6xl mx-auto px-4 md:px-6">
            <a href="#" className="flex items-center gap-2 no-underline text-foreground" aria-label="DNS Shield 首页">
              <Icons.Shield className="text-primary" />
              <span className="text-sm font-semibold tracking-tight">DNS Shield</span>
              <span className="text-[11px] text-muted-foreground font-medium">v3.6.0</span>
            </a>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleData}
                className="inline-flex items-center gap-1 h-7 px-2 text-[11px] font-medium text-muted-foreground bg-transparent border-none rounded-md cursor-pointer hover:bg-muted transition-colors"
                aria-label="切换数据状态"
              >
                {showData ? '有数据' : '空状态'}
              </button>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1 h-7 px-2 text-[11px] font-medium text-muted-foreground bg-transparent border-none rounded-md cursor-pointer hover:bg-muted transition-colors"
                aria-label="切换深色/浅色主题"
              >
                {isDark ? <Icons.Moon /> : <Icons.Sun />}
                {isDark ? '深色' : '浅色'}
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 py-6 md:py-10">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="mb-6 md:mb-8">
              <h1 className="text-[1.625rem] sm:text-2xl font-bold tracking-tight leading-tight">DNS Shield</h1>
              <p className="text-sm text-muted-foreground mt-2">路由器级全局广告过滤规则生成工具 — 输入域名清单，自动生成 Dnsmasq / Hosts / AdGuard 格式规则</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Input Panel */}
              <section className="flex-1 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md" aria-label="输入面板">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-tight">
                      <Icons.FileInput className="text-primary" />
                      输入域名清单
                    </h2>
                  </div>

                  {showData && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {[{ label: '域名', value: '6' }, { label: '黑名单', value: '6' }, { label: '白名单', value: '2' }, { label: '有效', value: '8' }, { label: '注释', value: '4' }].map(s => (
                        <StatItem key={s.label} value={s.value} label={s.label} />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-muted/40 mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
                        className="flex-1 h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground outline-none"
                        aria-label="URL 导入地址"
                      />
                      <button
                        className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        aria-label="获取远程域名列表"
                      >
                        获取
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['内置数据', 'AdGuard', 'EasyList', 'NeoHosts', 'StevenBlack'].map((name, i) => (
                        <span
                          key={name}
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 select-none',
                            i === 0
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-secondary'
                          )}
                          role="button"
                          tabIndex={0}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {showData ? (
                    <CodeEditor value={inputValue} onChange={setInputValue} />
                  ) : (
                    <EmptyState
                      icon={<Icons.FileText className="text-muted-foreground" />}
                      title="暂无域名"
                      description="输入域名或从 URL 导入后开始生成过滤规则"
                      action={{ label: '导入示例', onClick: () => setInputValue(MOCK_DOMAINS) }}
                    />
                  )}

                  {showData && (
                    <div className="flex flex-wrap gap-2 justify-end mt-3">
                      <button className="inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Icons.Play />
                        解析域名
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Output Panel */}
              <section className="flex-1 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md" aria-label="输出面板">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <h2 className="flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-tight">
                      <Icons.Code className="text-primary" />
                      生成过滤规则
                    </h2>
                    <FormatTabs current={format} onChange={setFormat} />
                  </div>

                  {showData ? (
                    <CodeEditor value={OUTPUT_SAMPLES[format] ?? ''} readOnly />
                  ) : (
                    <EmptyState
                      icon={<Icons.Code className="text-muted-foreground" />}
                      title="暂无输出"
                      description="请在左侧面板输入域名并点击「解析域名」按钮"
                    />
                  )}

                  {showData && (
                    <div className="flex flex-wrap gap-2 justify-end mt-3">
                      <button className="inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Icons.RotateCw />
                        生成规则
                      </button>
                      <button className="inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Icons.Download />
                        下载
                      </button>
                      <button className="inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors">
                        <Icons.Copy />
                        复制
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center mt-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-center gap-5 mb-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">GitHub</a>
              <span className="w-[3px] h-[3px] rounded-full bg-muted-foreground" />
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Demo</a>
              <span className="w-[3px] h-[3px] rounded-full bg-muted-foreground" />
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">文档</a>
              <span className="w-[3px] h-[3px] rounded-full bg-muted-foreground" />
              <span className="text-xs text-muted-foreground/70 font-mono">v3.6.0</span>
            </div>
            <p className="text-xs text-muted-foreground/70">DNS Shield — 路由器级广告过滤规则生成工具</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
