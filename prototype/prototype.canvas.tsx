// DNS Shield 高保真原型 v3.0
// 设计规范：Swiss Modernism 2.0 × Apple Precision
// 严格遵循 DNS Shield Design System v3.0
// 禁止使用 emoji 作为 UI 图标 — 全部使用 SVG Lucide 风格图标
// 包含：深色/浅色主题、有数据/空状态、所有组件状态展示

import React, { useState, useCallback } from 'react';

// ============================================
// 模拟数据
// ============================================

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
  dnsmasq: `# =====================================
# DNS Shield - Dnsmasq 广告过滤列表
# =====================================
#
# 路由器级广告过滤规则
# 版本: 3.1.0 | 域名: 6 个
# =====================================

address=/ad.mi.com/127.0.0.1
address=/ad.xiaomi.com/127.0.0.1
address=/ad.iqiyi.com/127.0.0.1
address=/log.iqiyi.com/127.0.0.1
address=/ad.youku.com/127.0.0.1
address=/ad.bilibili.com/127.0.0.1

# 白名单
server=/mi.com/
server=/iot.mi.com/`,

  hosts: `# =====================================
# DNS Shield - Hosts 广告过滤列表
# =====================================
# 版本: 3.1.0
# =====================================

127.0.0.1 ad.mi.com
127.0.0.1 ad.xiaomi.com
127.0.0.1 ad.iqiyi.com
127.0.0.1 log.iqiyi.com
127.0.0.1 ad.youku.com
127.0.0.1 ad.bilibili.com

# 白名单
# mi.com / iot.mi.com`,

  adguard: `! =====================================
! DNS Shield - AdGuard 广告过滤规则
! =====================================
! 版本: 3.1.0 | 域名: 6 个
! =====================================

||ad.mi.com^
||ad.xiaomi.com^
||ad.iqiyi.com^
||log.iqiyi.com^
||ad.youku.com^
||ad.bilibili.com^

! 白名单
@@||mi.com^
@@||iot.mi.com^`,

  whitelist: `# =====================================
# DNS Shield - 白名单列表
# =====================================
@@||mi.com^
@@||iot.mi.com^`
};

type Theme = 'light' | 'dark';
type FormatType = 'dnsmasq' | 'hosts' | 'adguard' | 'whitelist';

// ============================================
// SVG Icons 组件（Lucide 风格）
// ============================================

const Icons = {
  Shield: (props: { size?: number; className?: string }) => (
    <svg width={props.size ?? 22} height={props.size ?? 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  FileInput: (props: { size?: number }) => (
    <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  ArrowRight: (props: { size?: number }) => (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Link: (props: { size?: number }) => (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  ArrowUpDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Minus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  Save: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  RotateCw: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/>
      <path d="M5.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06c.26.26.7.44 1.12.33"/><path d="M12 2v2"/><path d="M12 20v2"/>
      <path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>
    </svg>
  ),
  Code: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  Terminal: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  Grid: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Sun: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Database: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  FileText: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
};

// ============================================
// 样式常量
// ============================================

const THEME = {
  dark: {
    bg: '#0A0A0F',
    surface: '#141419',
    elevated: '#1C1C24',
    muted: '#2C2C3A',
    input: '#1C1C24',
    text: '#F5F5F7',
    textSecondary: '#98989D',
    textTertiary: '#6E6E73',
    border: '#2C2C3A',
    primary: '#0A84FF',
    primaryHover: '#4DA3FF',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#F5F5F7',
    elevated: '#FFFFFF',
    muted: '#E8E8ED',
    input: '#F5F5F7',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    textTertiary: '#A1A1A6',
    border: '#D2D2D7',
    primary: '#007AFF',
    primaryHover: '#0056D3',
  }
};

// ============================================
// 子组件
// ============================================

function StatItem({ value, label, isDark }: { value: string; label: string; isDark: boolean }) {
  const t = isDark ? THEME.dark : THEME.light;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 12px', minWidth: 68,
      background: t.muted, borderRadius: 6,
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: t.text, lineHeight: 1.2 }}>{value}</span>
      <span style={{ fontSize: 11, color: t.textSecondary, marginTop: 2, letterSpacing: '0.01em' }}>{label}</span>
    </div>
  );
}

function CodeEditor({
  value, readOnly, minHeight, lines, placeholder, isDark, onChange
}: {
  value: string; readOnly?: boolean; minHeight?: number; lines?: number;
  placeholder?: string; isDark: boolean; onChange?: (v: string) => void;
}) {
  const t = isDark ? THEME.dark : THEME.light;
  const lineCount = lines ?? (value ? value.split('\n').length : 1);

  const editorStyle: React.CSSProperties = {
    flex: 1, width: '100%', minHeight: minHeight ?? 240,
    padding: '12px', paddingLeft: 52,
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 13, lineHeight: 1.6,
    color: t.text, background: t.input,
    border: 'none', outline: 'none',
    resize: readOnly ? 'none' : 'vertical',
    cursor: readOnly ? 'default' : 'text',
  };

  const gutterLines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div style={{
      border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', position: 'relative' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          padding: '12px 8px', minWidth: 44,
          background: t.muted, borderRight: `1px solid ${t.border}`,
          userSelect: 'none', flexShrink: 0,
        }}>
          {gutterLines.map(n => (
            <span key={n} style={{
              fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
              fontSize: 13, lineHeight: 1.6, height: 20.8,
              color: t.textTertiary,
            }}>{n}</span>
          ))}
        </div>
        {readOnly ? (
          <pre style={{
            ...editorStyle, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            overflow: 'auto',
          }}>{value || <span style={{ color: t.textTertiary }}>// 暂无输出数据</span>}</pre>
        ) : (
          <textarea
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={editorStyle}
            spellCheck={false}
            aria-label="域名编辑器"
          />
        )}
      </div>
    </div>
  );
}

function FormatTabs({
  current, onChange, isDark
}: {
  current: FormatType; onChange: (f: FormatType) => void; isDark: boolean;
}) {
  const t = isDark ? THEME.dark : THEME.light;
  const formats: { key: FormatType; label: string; icon: React.ReactNode }[] = [
    { key: 'dnsmasq', label: 'Dnsmasq', icon: <Icons.Terminal /> },
    { key: 'hosts', label: 'Hosts', icon: <Icons.Grid /> },
    { key: 'adguard', label: 'AdGuard', icon: <Icons.ShieldCheck /> },
    { key: 'whitelist', label: '白名单', icon: <Icons.Check /> },
  ];

  return (
    <div style={{
      display: 'inline-flex', padding: 2, background: t.muted,
      borderRadius: 8, gap: 2,
    }} role="tablist">
      {formats.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          role="tab"
          aria-selected={current === f.key}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', fontSize: 12, fontWeight: 500,
            color: current === f.key ? t.text : t.textSecondary,
            background: current === f.key ? t.elevated : 'transparent',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            boxShadow: current === f.key ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {f.icon}
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// 主组件
// ============================================

export default function PrototypeCanvas() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [format, setFormat] = useState<FormatType>('dnsmasq');
  const [showData, setShowData] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const isDark = theme === 'dark';
  const t = isDark ? THEME.dark : THEME.light;
  const [inputValue, setInputValue] = useState(MOCK_DOMAINS);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const toggleData = useCallback(() => {
    setShowData(prev => !prev);
    if (showData) setInputValue('');
    else setInputValue(MOCK_DOMAINS);
  }, [showData]);

  const headerBg = `color-mix(in srgb, ${t.elevated} 92%, transparent)`;
  const shadowStyle: React.CSSProperties = { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };

  const stats = [
    { label: '域名', value: '6' },
    { label: '黑名单', value: '6' },
    { label: '白名单', value: '2' },
    { label: '有效', value: '8' },
    { label: '注释', value: '4' },
  ];

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: t.bg, color: t.text,
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      transition: 'background 300ms ease, color 300ms ease',
    }}>
      {/* ====== Sticky Header ====== */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: headerBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: `1px solid ${t.border}`,
        transition: 'background 300ms ease, border-color 300ms ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 48, maxWidth: 1120, margin: '0 auto',
          padding: '0 16px',
        }}>
          <a href="#" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: t.text,
          }} aria-label="DNS Shield 首页">
            <Icons.Shield />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>DNS Shield</span>
            <span style={{ fontSize: 11, color: t.textTertiary, fontWeight: 500 }}>v3.0</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              fontSize: 11, fontWeight: 500,
              color: t.primary, background: `color-mix(in srgb, ${t.primary} 15%, transparent)`,
              cursor: 'default',
            }}>
              <Icons.Database />
              原型预览
            </span>

            <button onClick={toggleData}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                height: 28, padding: '0 8px',
                fontSize: 11, fontWeight: 500, color: t.textSecondary,
                background: 'transparent', border: 'none', borderRadius: 6,
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
              aria-label="切换数据状态"
            >
              <Icons.Database />
              {showData ? '有数据' : '空状态'}
            </button>

            <button onClick={toggleTheme}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                height: 28, padding: '0 8px',
                fontSize: 11, fontWeight: 500, color: t.textSecondary,
                background: 'transparent', border: 'none', borderRadius: 6,
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
              aria-label="切换深色/浅色主题"
            >
              {isDark ? <Icons.Moon /> : <Icons.Sun />}
              {isDark ? '深色' : '浅色'}
            </button>
          </div>
        </div>
      </header>

      {/* ====== Main Content ====== */}
      <main style={{ flex: 1, padding: '24px 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px' }}>

          {/* Page Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
              lineHeight: 1.2, margin: 0,
            }}>DNS Shield</h1>
            <p style={{
              fontSize: 14, color: t.textSecondary, marginTop: 8,
            }}>路由器级全局广告过滤规则生成工具 — 输入域名清单，自动生成 Dnsmasq / Hosts / AdGuard 格式规则</p>
          </div>

          {/* ====== Dual Panel Grid ====== */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr',
            gap: 16,
          }} className="prototype-grid-2">
            <style>{`
              @media (min-width: 1024px) {
                .prototype-grid-2 {
                  grid-template-columns: 1fr 1fr !important;
                  gap: 24px !important;
                }
              }
            `}</style>

            {/* ====== INPUT PANEL ====== */}
            <section style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: 20,
              transition: 'background 300ms ease, border-color 300ms ease',
            }} aria-label="输入面板">
              {/* Panel Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <h2 style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', margin: 0,
                  color: t.text,
                }}>
                  <Icons.FileInput />
                  输入域名清单
                </h2>
                <button onClick={() => setShowSettings(!showSettings)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: t.textSecondary,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 8px', borderRadius: 6,
                    transition: 'all 150ms ease',
                  }}
                  aria-label="展开/收起高级选项"
                  aria-expanded={showSettings}
                >
                  <span style={{ transform: showSettings ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease', display: 'flex' }}>
                    <Icons.ChevronDown />
                  </span>
                  高级选项
                </button>
              </div>

              {/* Stats */}
              {showData && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
                }}>
                  {stats.map(s => (
                    <StatItem key={s.label} value={s.value} label={s.label} isDark={isDark} />
                  ))}
                </div>
              )}

              {/* URL Import */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                padding: 12, background: t.input,
                border: `1px solid ${t.border}`, borderRadius: 8,
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: t.textTertiary, pointerEvents: 'none', display: 'flex',
                    }}>
                      <Icons.Link />
                    </span>
                    <input
                      type="text"
                      readOnly
                      value="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
                      style={{
                        width: '100%', height: 36, paddingLeft: 36, paddingRight: 12,
                        fontSize: 14, color: t.text, background: t.elevated,
                        border: `1px solid ${t.border}`, borderRadius: 8,
                        outline: 'none',
                      }}
                      aria-label="URL 导入地址"
                    />
                  </div>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 14px',
                    fontSize: 13, fontWeight: 500, color: '#FFFFFF',
                    background: t.primary, border: 'none', borderRadius: 8,
                    cursor: 'pointer', transition: 'all 150ms ease',
                  }} aria-label="获取远程域名列表">
                    <Icons.ArrowRight />
                    获取
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['内置数据', 'AdGuard', 'EasyList', 'NeoHosts', 'StevenBlack'].map((name, i) => (
                    <span key={name} style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 6,
                      fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', userSelect: 'none',
                      transition: 'all 150ms ease',
                      ...(i === 0 ? {
                        background: t.primary, color: '#FFFFFF',
                      } : {
                        background: t.muted, color: t.textSecondary,
                        border: '1px solid transparent',
                      }),
                    }} role="button" tabIndex={0} aria-label={`选择预设: ${name}`}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Editor */}
              {showData ? (
                <CodeEditor
                  value={inputValue}
                  onChange={setInputValue}
                  isDark={isDark}
                  placeholder="# 输入域名，每行一个\nad.example.com\n# + 开头为白名单\n# @domain=ip 为自定义DNS"
                />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '64px 16px', textAlign: 'center',
                }}>
                  <Icons.FileText />
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 16, color: t.text, letterSpacing: '-0.01em' }}>暂无数据</h3>
                  <p style={{ fontSize: 14, color: t.textSecondary, marginTop: 8, maxWidth: 280 }}>
                    输入域名或导入 URL 后即可开始生成过滤规则
                  </p>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 16px', marginTop: 20,
                    fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                    background: t.primary, border: 'none', borderRadius: 8,
                    cursor: 'pointer',
                  }}>
                    <Icons.Plus />
                    导入域名
                  </button>
                </div>
              )}

              {/* Settings Panel */}
              {showSettings && (
                <div style={{
                  padding: 16, background: t.muted, borderRadius: 8, marginTop: 12, marginBottom: 12,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                  }}>
                    <span style={{ fontSize: 12, color: t.textSecondary }}>自动排序域名</span>
                    <div style={{ position: 'relative', width: 36, height: 22, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <div style={{
                        position: 'absolute', inset: 0, background: t.primary,
                        borderRadius: 9999, transition: 'background 150ms ease',
                      }} />
                      <div style={{
                        position: 'absolute', top: 2, left: 16, width: 18, height: 18,
                        background: '#FFFFFF', borderRadius: '50%',
                        transition: 'transform 150ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }} />
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderTop: `1px solid ${t.border}`,
                  }}>
                    <span style={{ fontSize: 12, color: t.textSecondary }}>启用智能去重</span>
                    <div style={{ position: 'relative', width: 36, height: 22, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <div style={{
                        position: 'absolute', inset: 0, background: t.primary,
                        borderRadius: 9999, transition: 'background 150ms ease',
                      }} />
                      <div style={{
                        position: 'absolute', top: 2, left: 16, width: 18, height: 18,
                        background: '#FFFFFF', borderRadius: '50%',
                        transition: 'transform 150ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {showData && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end',
                }}>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    height: 28, padding: '0 8px', fontSize: 11, fontWeight: 500,
                    color: t.textSecondary, background: 'transparent',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                  }} aria-label="清空编辑器">
                    <Icons.Trash /> 清空
                  </button>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    height: 28, padding: '0 8px', fontSize: 11, fontWeight: 500,
                    color: t.textSecondary, background: 'transparent',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                  }} aria-label="排序域名">
                    <Icons.ArrowUpDown /> 排序
                  </button>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    height: 28, padding: '0 8px', fontSize: 11, fontWeight: 500,
                    color: t.textSecondary, background: 'transparent',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                  }} aria-label="去重域名">
                    <Icons.Minus /> 去重
                  </button>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    height: 28, padding: '0 10px', fontSize: 11, fontWeight: 500,
                    color: t.textSecondary, background: t.elevated,
                    border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer',
                  }} aria-label="保存到本地">
                    <Icons.Save /> 保存
                  </button>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 14px', fontSize: 13, fontWeight: 500,
                    color: '#FFFFFF', background: t.primary, border: 'none',
                    borderRadius: 8, cursor: 'pointer', ...shadowStyle,
                  }} aria-label="解析并生成规则">
                    <Icons.Play /> 解析域名
                  </button>
                </div>
              )}
            </section>

            {/* ====== OUTPUT PANEL ====== */}
            <section style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: 20,
              transition: 'background 300ms ease, border-color 300ms ease',
            }} aria-label="输出面板">
              {/* Panel Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16, flexWrap: 'wrap', gap: 8,
              }}>
                <h2 style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', margin: 0,
                  color: t.text,
                }}>
                  <Icons.Code />
                  生成过滤规则
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FormatTabs current={format} onChange={setFormat} isDark={isDark} />
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, color: t.textSecondary,
                    background: 'transparent', border: 'none', borderRadius: 6,
                    cursor: 'pointer', transition: 'all 150ms ease',
                    position: 'relative',
                  }}
                    aria-label="输出设置"
                    title="输出设置"
                  >
                    <Icons.Settings />
                  </button>
                </div>
              </div>

              {/* Merge Info */}
              {showData && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 12,
                  fontSize: 12, color: t.textSecondary, padding: '8px 0',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.primary, flexShrink: 0 }} />
                    黑名单: 6
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34C759', flexShrink: 0 }} />
                    白名单: 2
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.textTertiary, flexShrink: 0 }} />
                    自定义 DNS: 0
                  </span>
                  <span>Dnsmasq: 6 行</span>
                  <span>Hosts: 6 行</span>
                  <span>AdGuard: 6 行</span>
                </div>
              )}

              {/* Output Preview */}
              {showData ? (
                <CodeEditor
                  value={OUTPUT_SAMPLES[format] ?? ''}
                  readOnly
                  isDark={isDark}
                />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '64px 16px', textAlign: 'center',
                  border: `1px solid ${t.border}`, borderRadius: 8,
                  background: t.input,
                }}>
                  <Icons.FileText />
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 16, color: t.text, letterSpacing: '-0.01em' }}>暂无输出</h3>
                  <p style={{ fontSize: 14, color: t.textSecondary, marginTop: 8, maxWidth: 280 }}>
                    请在左侧面板输入域名并点击"解析域名"按钮
                  </p>
                </div>
              )}

              {/* Output Buttons */}
              {showData && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 12,
                }}>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 16px', fontSize: 13, fontWeight: 500,
                    color: '#FFFFFF', background: t.primary, border: 'none',
                    borderRadius: 8, cursor: 'pointer', ...shadowStyle,
                  }} aria-label="重新生成规则">
                    <Icons.RotateCw /> 生成规则
                  </button>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 16px', fontSize: 13, fontWeight: 500,
                    color: '#FFFFFF', background: t.primary, border: 'none',
                    borderRadius: 8, cursor: 'pointer', ...shadowStyle,
                  }} aria-label="下载规则文件">
                    <Icons.Download /> 下载
                  </button>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 16px', fontSize: 13, fontWeight: 500,
                    color: t.text, background: t.elevated,
                    border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer',
                  }} aria-label="复制到剪贴板">
                    <Icons.Copy /> 复制
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ====== Footer ====== */}
      <footer style={{
        borderTop: `1px solid ${t.border}`, padding: '24px 0',
        textAlign: 'center', transition: 'border-color 300ms ease',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 24, marginBottom: 12,
          }}>
            <a href="#" style={{ fontSize: 12, color: t.textSecondary, textDecoration: 'none' }}>GitHub</a>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: t.textTertiary }} />
            <a href="#" style={{ fontSize: 12, color: t.textSecondary, textDecoration: 'none' }}>Demo</a>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: t.textTertiary }} />
            <a href="#" style={{ fontSize: 12, color: t.textSecondary, textDecoration: 'none' }}>文档</a>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: t.textTertiary }} />
            <span style={{ fontSize: 12, color: t.textTertiary, cursor: 'default' }}>v3.1.0</span>
          </div>
          <p style={{ fontSize: 12, color: t.textTertiary }}>DNS Shield — 路由器级广告过滤规则生成工具</p>
        </div>
      </footer>
    </div>
  );
}
