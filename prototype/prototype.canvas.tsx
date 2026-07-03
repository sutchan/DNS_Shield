// DNS Shield 高保真原型 v3.1.0
// 设计规范：Swiss Modernism 2.0 × Apple Precision
// 严格遵循 DNS Shield Design System v3.1.0
import React, { useState, useCallback } from 'react';

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
# 版本: 3.1.0 | 域名: 6 个

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
# 版本: 3.1.0

127.0.0.1 ad.mi.com
127.0.0.1 ad.xiaomi.com
127.0.0.1 ad.iqiyi.com
127.0.0.1 log.iqiyi.com
127.0.0.1 ad.youku.com
127.0.0.1 ad.bilibili.com`,
  adguard: `! DNS Shield - AdGuard 广告过滤规则
! 版本: 3.1.0 | 域名: 6 个

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

const Icons = {
  Shield: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
  FileInput: () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Play: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  RotateCw: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Download: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Copy: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Moon: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Code: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  Terminal: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Grid: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>,
  ShieldCheck: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Check: () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const THEME = {
  dark: { bg:'#0A0A0F', surface:'#141419', elevated:'#1C1C24', muted:'#2C2C3A', input:'#1C1C24', text:'#F5F5F7', textSecondary:'#98989D', textTertiary:'#6E6E73', border:'#2C2C3A', primary:'#0A84FF', primaryHover:'#4DA3FF' },
  light: { bg:'#FFFFFF', surface:'#F5F5F7', elevated:'#FFFFFF', muted:'#E8E8ED', input:'#F5F5F7', text:'#1D1D1F', textSecondary:'#6E6E73', textTertiary:'#A1A1A6', border:'#D2D2D7', primary:'#007AFF', primaryHover:'#0056D3' }
};

function StatItem({ value, label, isDark }: { value: string; label: string; isDark: boolean }) {
  const t = isDark ? THEME.dark : THEME.light;
  return <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 12px', minWidth:68, background:t.muted, borderRadius:6 }}><span style={{ fontSize:14, fontWeight:600, color:t.text, lineHeight:1.2 }}>{value}</span><span style={{ fontSize:11, color:t.textSecondary, marginTop:2, letterSpacing:'0.01em' }}>{label}</span></div>;
}

function CodeEditor({ value, readOnly, isDark, onChange }: { value: string; readOnly?: boolean; isDark: boolean; onChange?: (v: string) => void }) {
  const t = isDark ? THEME.dark : THEME.light;
  const lineCount = value ? value.split('\n').length : 1;
  const gutterLines = Array.from({ length: lineCount }, (_, i) => i + 1);
  const editorStyle: React.CSSProperties = { flex:1, width:'100%', minHeight:240, padding:'12px', fontFamily:"'SF Mono','JetBrains Mono',monospace", fontSize:13, lineHeight:1.6, color:t.text, background:t.input, border:'none', outline:'none', resize:readOnly?'none':'vertical', cursor:readOnly?'default':'text' };
  return <div style={{ border:`1px solid ${t.border}`, borderRadius:8, overflow:'hidden' }}><div style={{ display:'flex', position:'relative' }}><div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', padding:'12px 8px', minWidth:44, background:t.muted, borderRight:`1px solid ${t.border}`, userSelect:'none', flexShrink:0 }}>{gutterLines.map(n=><span key={n} style={{ fontFamily:"'SF Mono','JetBrains Mono',monospace", fontSize:13, lineHeight:1.6, height:20.8, color:t.textTertiary }}>{n}</span>)}</div>{readOnly?<pre style={{ ...editorStyle, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all', overflow:'auto' }}>{value}</pre>:<textarea value={value} onChange={e=>onChange?.(e.target.value)} style={editorStyle} spellCheck={false} aria-label="域名编辑器"/>}</div></div>;
}

function FormatTabs({ current, onChange, isDark }: { current: FormatType; onChange: (f: FormatType) => void; isDark: boolean }) {
  const t = isDark ? THEME.dark : THEME.light;
  const formats: { key: FormatType; label: string; icon: React.ReactNode }[] = [{ key:'dnsmasq', label:'Dnsmasq', icon:<Icons.Terminal/> },{ key:'hosts', label:'Hosts', icon:<Icons.Grid/> },{ key:'adguard', label:'AdGuard', icon:<Icons.ShieldCheck/> },{ key:'whitelist', label:'白名单', icon:<Icons.Check/> }];
  return <div style={{ display:'inline-flex', padding:2, background:t.muted, borderRadius:8, gap:2 }} role="tablist">{formats.map(f=><button key={f.key} onClick={()=>onChange(f.key)} role="tab" aria-selected={current===f.key} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', fontSize:12, fontWeight:500, color:current===f.key?t.text:t.textSecondary, background:current===f.key?t.elevated:'transparent', border:'none', borderRadius:6, cursor:'pointer', boxShadow:current===f.key?'0 1px 2px rgba(0,0,0,0.05)':'none', transition:'all 150ms ease', whiteSpace:'nowrap' }}>{f.icon}{f.label}</button>)}</div>;
}

export default function PrototypeCanvas() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [format, setFormat] = useState<FormatType>('dnsmasq');
  const [showData, setShowData] = useState(true);
  const isDark = theme === 'dark';
  const t = isDark ? THEME.dark : THEME.light;
  const [inputValue, setInputValue] = useState(MOCK_DOMAINS);

  const toggleTheme = useCallback(() => setTheme(prev=>prev==='dark'?'light':'dark'), []);
  const toggleData = useCallback(() => { setShowData(prev=>!prev); if(showData) setInputValue(''); else setInputValue(MOCK_DOMAINS); }, [showData]);

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:t.bg, color:t.text, fontFamily:"'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif", transition:'background 300ms ease, color 300ms ease' }}>
      <header style={{ position:'sticky', top:0, zIndex:10, background:`color-mix(in srgb, ${t.elevated} 92%, transparent)`, backdropFilter:'blur(16px) saturate(180%)', WebkitBackdropFilter:'blur(16px) saturate(180%)', borderBottom:`1px solid ${t.border}`, transition:'background 300ms ease, border-color 300ms ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:48, maxWidth:1120, margin:'0 auto', padding:'0 16px' }}>
          <a href="#" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', color:t.text }} aria-label="DNS Shield 首页"><Icons.Shield /><span style={{ fontSize:14, fontWeight:600, letterSpacing:'-0.01em' }}>DNS Shield</span><span style={{ fontSize:11, color:t.textTertiary, fontWeight:500 }}>v3.1.0</span></a>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={toggleData} style={{ display:'inline-flex', alignItems:'center', gap:4, height:28, padding:'0 8px', fontSize:11, fontWeight:500, color:t.textSecondary, background:'transparent', border:'none', borderRadius:6, cursor:'pointer', transition:'all 150ms ease' }} aria-label="切换数据状态">{showData?'有数据':'空状态'}</button>
            <button onClick={toggleTheme} style={{ display:'inline-flex', alignItems:'center', gap:4, height:28, padding:'0 8px', fontSize:11, fontWeight:500, color:t.textSecondary, background:'transparent', border:'none', borderRadius:6, cursor:'pointer', transition:'all 150ms ease' }} aria-label="切换深色/浅色主题">{isDark?<Icons.Moon />:<Icons.Sun />}{isDark?'深色':'浅色'}</button>
          </div>
        </div>
      </header>
      <main style={{ flex:1, padding:'24px 0' }}>
        <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ marginBottom:24 }}><h1 style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2, margin:0 }}>DNS Shield</h1><p style={{ fontSize:14, color:t.textSecondary, marginTop:8 }}>路由器级全局广告过滤规则生成工具 — 输入域名清单，自动生成 Dnsmasq / Hosts / AdGuard 格式规则</p></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }} className="prototype-grid">
            <style>{`@media(min-width:1024px){.prototype-grid{grid-template-columns:1fr 1fr!important;gap:24px!important}}`}</style>
            <section style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:20, transition:'background 300ms ease, border-color 300ms ease' }} aria-label="输入面板">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}><h2 style={{ display:'flex', alignItems:'center', gap:8, fontSize:18, fontWeight:600, letterSpacing:'-0.01em', margin:0, color:t.text }}><Icons.FileInput />输入域名清单</h2></div>
              {showData && <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>{[{ label:'域名',value:'6' },{ label:'黑名单',value:'6' },{ label:'白名单',value:'2' },{ label:'有效',value:'8' },{ label:'注释',value:'4' }].map(s=><StatItem key={s.label} value={s.value} label={s.label} isDark={isDark} />)}</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:12, padding:12, background:t.input, border:`1px solid ${t.border}`, borderRadius:8, marginBottom:12 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <div style={{ position:'relative', flex:1 }}><input type="text" readOnly value="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt" style={{ width:'100%', height:36, padding:'0 12px', fontSize:14, color:t.text, background:t.elevated, border:`1px solid ${t.border}`, borderRadius:8, outline:'none' }} aria-label="URL 导入地址"/></div>
                  <button style={{ display:'inline-flex', alignItems:'center', gap:6, height:36, padding:'0 14px', fontSize:13, fontWeight:500, color:'#FFFFFF', background:t.primary, border:'none', borderRadius:8, cursor:'pointer', transition:'all 150ms ease' }} aria-label="获取远程域名列表">获取</button>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{['内置数据','AdGuard','EasyList','NeoHosts','StevenBlack'].map((name,i)=><span key={name} style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer', userSelect:'none', transition:'all 150ms ease', ...(i===0?{ background:t.primary, color:'#FFFFFF' }:{ background:t.muted, color:t.textSecondary, border:'1px solid transparent' }) }} role="button" tabIndex={0}>{name}</span>)}</div>
              </div>
              {showData?<CodeEditor value={inputValue} onChange={setInputValue} isDark={isDark} />:<div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 16px', textAlign:'center' }}><h3 style={{ fontSize:18, fontWeight:600, marginTop:16, color:t.text }}>暂无数据</h3><p style={{ fontSize:14, color:t.textSecondary, marginTop:8, maxWidth:280 }}>输入域名或导入 URL 后即可开始生成过滤规则</p></div>}
              {showData && <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'flex-end', marginTop:12 }}>
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, height:36, padding:'0 14px', fontSize:13, fontWeight:500, color:'#FFFFFF', background:t.primary, border:'none', borderRadius:8, cursor:'pointer' }} aria-label="解析并生成规则"><Icons.Play />解析域名</button>
              </div>}
            </section>
            <section style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:20, transition:'background 300ms ease, border-color 300ms ease' }} aria-label="输出面板">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}><h2 style={{ display:'flex', alignItems:'center', gap:8, fontSize:18, fontWeight:600, letterSpacing:'-0.01em', margin:0, color:t.text }}><Icons.Code />生成过滤规则</h2><FormatTabs current={format} onChange={setFormat} isDark={isDark} /></div>
              {showData?<CodeEditor value={OUTPUT_SAMPLES[format]??''} readOnly isDark={isDark} />:<div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 16px', textAlign:'center', border:`1px solid ${t.border}`, borderRadius:8, background:t.input }}><h3 style={{ fontSize:18, fontWeight:600, marginTop:16, color:t.text }}>暂无输出</h3><p style={{ fontSize:14, color:t.textSecondary, marginTop:8, maxWidth:280 }}>请在左侧面板输入域名并点击"解析域名"按钮</p></div>}
              {showData && <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'flex-end', marginTop:12 }}>
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, height:36, padding:'0 16px', fontSize:13, fontWeight:500, color:'#FFFFFF', background:t.primary, border:'none', borderRadius:8, cursor:'pointer' }} aria-label="重新生成规则"><Icons.RotateCw />生成规则</button>
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, height:36, padding:'0 16px', fontSize:13, fontWeight:500, color:'#FFFFFF', background:t.primary, border:'none', borderRadius:8, cursor:'pointer' }} aria-label="下载规则文件"><Icons.Download />下载</button>
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, height:36, padding:'0 16px', fontSize:13, fontWeight:500, color:t.text, background:t.elevated, border:`1px solid ${t.border}`, borderRadius:8, cursor:'pointer' }} aria-label="复制到剪贴板"><Icons.Copy />复制</button>
              </div>}
            </section>
          </div>
        </div>
      </main>
      <footer style={{ borderTop:`1px solid ${t.border}`, padding:'24px 0', textAlign:'center', transition:'border-color 300ms ease' }}>
        <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, marginBottom:12 }}><a href="#" style={{ fontSize:12, color:t.textSecondary, textDecoration:'none' }}>GitHub</a><span style={{ width:3, height:3, borderRadius:'50%', background:t.textTertiary }}/><a href="#" style={{ fontSize:12, color:t.textSecondary, textDecoration:'none' }}>Demo</a><span style={{ width:3, height:3, borderRadius:'50%', background:t.textTertiary }}/><a href="#" style={{ fontSize:12, color:t.textSecondary, textDecoration:'none' }}>文档</a><span style={{ width:3, height:3, borderRadius:'50%', background:t.textTertiary }}/><span style={{ fontSize:12, color:t.textTertiary, cursor:'default' }}>v3.1.0</span></div>
          <p style={{ fontSize:12, color:t.textTertiary }}>DNS Shield — 路由器级广告过滤规则生成工具</p>
        </div>
      </footer>
    </div>
  );
}
