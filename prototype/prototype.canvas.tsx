// DNS Shield 高保真原型 v2.3.2
// 展示完整 UI 布局、深色/浅色主题、空状态/有数据状态
import React, { useState } from 'react';

const mockDomains = `# === 白名单 ===
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

const mockDnsmasq = `# =====================================
# DNS Shield - Dnsmasq 广告过滤列表
# =====================================
#
# 路由器级广告过滤规则
#
# 版本: 2.3.2
# 域名: 6 个唯一域名
#
# 使用方法:
# - 梅林: 软件中心 -> DNS 设置
# - OpenWrt: 服务 -> DHCP 和 DNS
#
# 项目: https://github.com/sutchan/DNS_Shield
# =====================================

address=/ad.mi.com/127.0.0.1
address=/ad.xiaomi.com/127.0.0.1
address=/ad.iqiyi.com/127.0.0.1
address=/log.iqiyi.com/127.0.0.1
address=/ad.youku.com/127.0.0.1
address=/ad.bilibili.com/127.0.0.1

# 白名单 (允许这些域名)
server=/mi.com/
server=/iot.mi.com/`;

const mockAdguard = `! =====================================
! DNS Shield - AdGuard 广告过滤规则
! =====================================
!
! 版本: 2.3.2
! 域名: 6 个唯一域名
!
! ====================================

||ad.mi.com^
||ad.xiaomi.com^
||ad.iqiyi.com^
||log.iqiyi.com^
||ad.youku.com^
||ad.bilibili.com^

! 白名单
@@||mi.com^
@@||iot.mi.com^`;

type Theme = 'light' | 'dark';
type Format = 'dnsmasq' | 'hosts' | 'adguard' | 'whitelist';

export default function PrototypeCanvas() {
  const [theme, setTheme] = useState<Theme>('light');
  const [format, setFormat] = useState<Format>('dnsmasq');
  const [showData, setShowData] = useState(true);

  const isDark = theme === 'dark';

  const bg = isDark ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]';
  const cardBg = isDark ? 'bg-[#1c1c1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]';
  const textSecondary = isDark ? 'text-[#98989d]' : 'text-[#86868b]';
  const borderColor = isDark ? 'border-[#38383a]' : 'border-[#d2d2d7]';
  const inputBg = isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]';
  const primaryBg = 'bg-[#007AFF]';
  const primaryText = 'text-white';
  const mutedBg = isDark ? 'bg-[#2c2c2e]' : 'bg-[#e8e8ed]';

  const outputContent: Record<Format, string> = {
    dnsmasq: mockDnsmasq,
    hosts: mockDnsmasq.replace(/address=\//g, '127.0.0.1 ').replace(/\/127.0.0.1/g, '').replace(/server=\//g, '# 白名单: '),
    adguard: mockAdguard,
    whitelist: '# 白名单 (允许这些域名)\n@@||mi.com^\n@@||iot.mi.com^'
  };

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} transition-colors duration-300`} style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* 原型控制栏 */}
      <div className={`sticky top-0 z-50 ${isDark ? 'bg-[#1c1c1e]/95' : 'bg-white/95'} backdrop-blur-sm border-b ${borderColor} px-4 py-2 flex items-center justify-between`}>
        <span className="text-xs font-medium text-[#007AFF]">🛡️ DNS Shield v2.3.2 — 高保真原型</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowData(!showData)} className={`text-xs px-2 py-1 rounded ${mutedBg} ${textSecondary}`}>
            {showData ? '📊 有数据' : '📭 空状态'}
          </button>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`text-xs px-2 py-1 rounded ${mutedBg} ${textSecondary}`}>
            {isDark ? '☀️ 浅色' : '🌙 深色'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span>🛡️</span>
              <span>DNS Shield</span>
            </h1>
            <div className="flex items-center gap-2">
              <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border ${borderColor} ${cardBg}`}>
                <span>🇨🇳</span>
                <span className="text-xs">中文简体</span>
              </button>
              <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`inline-flex items-center justify-center w-8 h-8 rounded-md border ${borderColor} ${cardBg}`}>
                <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
              </button>
            </div>
          </div>
          <p className={`text-sm ${textSecondary} mt-1`}>路由器级全局广告过滤规则生成工具</p>
        </header>

        {/* 双栏布局 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 左侧 - 输入面板 */}
          <section className={`flex-1 rounded-lg border ${borderColor} ${cardBg} shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold tracking-tight">📥 输入域名清单</h2>
              <button className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded ${mutedBg} ${textSecondary}`}>
                <span className="text-xs">▼</span>
                <span>高级选项</span>
              </button>
            </div>

            {/* 统计信息 */}
            {showData && (
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: '域名', value: '6' },
                  { label: '黑名单', value: '6' },
                  { label: '白名单', value: '2' },
                  { label: '有效', value: '8' },
                  { label: '注释', value: '4' }
                ].map(stat => (
                  <div key={stat.label} className={`inline-flex flex-col items-center px-3 py-1 rounded-md ${mutedBg} ${textSecondary} text-xs min-w-[64px]`}>
                    <span className={`text-base font-semibold ${textPrimary}`}>{stat.value}</span>
                    <span className="mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* URL 导入区域 */}
            <div className={`mb-3 p-3 rounded-md border ${borderColor} ${inputBg}`}>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="输入 URL 导入域名列表..."
                  className={`flex-1 h-8 px-3 rounded-md border ${borderColor} ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} text-sm`}
                  defaultValue="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
                  readOnly
                />
                <button className={`h-8 px-3 rounded-md text-sm font-medium ${primaryBg} ${primaryText}`}>获取</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['内置数据', 'AdGuard', 'EasyList', 'NeoHosts'].map((preset, i) => (
                  <span key={preset} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs cursor-pointer ${i === 0 ? `${primaryBg} ${primaryText}` : `${mutedBg} ${textSecondary}`}`}>
                    {preset}
                  </span>
                ))}
              </div>
            </div>

            {/* 域名编辑器 */}
            <div className={`relative border ${borderColor} rounded-md overflow-hidden mb-3`}>
              <div className={`absolute left-0 top-0 bottom-0 w-10 ${mutedBg} border-r ${borderColor} py-2 px-1 text-right text-xs ${textSecondary} font-mono`}>
                {showData ? mockDomains.split('\n').map((_, i) => <div key={i}>{i + 1}</div>).slice(0, 20) : <div>1</div>}
              </div>
              <textarea
                className={`w-full min-h-[200px] py-2 pl-12 pr-3 text-xs font-mono ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} resize-none`}
                value={showData ? mockDomains : ''}
                placeholder={showData ? undefined : '# 输入域名，每行一个\nad.example.com\n# + 开头为白名单\n# @domain=ip 为自定义DNS'}
                readOnly
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2 justify-end">
              <button className={`h-8 px-3 rounded-md text-xs font-medium border ${borderColor} ${cardBg}`}>🗑️ 清空</button>
              <button className={`h-8 px-3 rounded-md text-xs font-medium border ${borderColor} ${cardBg}`}>↕️ 排序</button>
              <button className={`h-9 px-4 rounded-md text-sm font-medium ${primaryBg} ${primaryText}`}>解析域名</button>
              <button className={`h-8 px-3 rounded-md text-xs font-medium border ${borderColor} ${cardBg}`}>🔄 去重</button>
              <button className={`h-8 px-3 rounded-md text-xs font-medium border ${borderColor} ${cardBg}`}>💾 保存</button>
            </div>
          </section>

          {/* 右侧 - 输出面板 */}
          <section className={`flex-1 rounded-lg border ${borderColor} ${cardBg} shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold tracking-tight">📤 生成过滤规则</h2>
              <div className="flex items-center gap-2">
                {/* 格式 Tabs */}
                <div className={`inline-flex items-center p-0.5 rounded-lg ${mutedBg}`}>
                  {(['dnsmasq', 'hosts', 'adguard', 'whitelist'] as Format[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${format === f ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
                    >
                      {f === 'dnsmasq' ? 'Dnsmasq' : f === 'hosts' ? 'Hosts' : f === 'adguard' ? 'AdGuard' : '白名单'}
                    </button>
                  ))}
                </div>
                <button className={`inline-flex items-center justify-center w-8 h-8 rounded-md border ${borderColor} ${cardBg}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 合并信息 */}
            {showData && (
              <div className={`text-xs ${textSecondary} mb-3 px-1`}>
                黑名单: 6 | 白名单: 2 | 自定义DNS: 0 | Dnsmasq: 6 行 | Hosts: 6 行 | AdGuard: 6 行
              </div>
            )}

            {/* 输出预览 */}
            <div className={`relative border ${borderColor} rounded-md overflow-hidden mb-3`}>
              <div className={`absolute left-0 top-0 bottom-0 w-10 ${mutedBg} border-r ${borderColor} py-2 px-1 text-right text-xs ${textSecondary} font-mono`}>
                {(outputContent[format] || '').split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <pre className={`w-full min-h-[200px] py-2 pl-12 pr-3 text-xs font-mono overflow-auto ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} whitespace-pre-wrap`}>
                {showData ? outputContent[format] : '// 生成的规则将显示在这里'}
              </pre>
            </div>

            {/* 输出按钮 */}
            <div className="flex flex-wrap gap-2 justify-end">
              <button className={`h-9 px-4 rounded-md text-sm font-medium ${primaryBg} ${primaryText}`}>🔄 生成规则</button>
              <button className={`h-9 px-4 rounded-md text-sm font-medium ${primaryBg} ${primaryText}`}>📥 下载</button>
              <button className={`h-9 px-4 rounded-md text-sm font-medium border ${borderColor} ${cardBg}`}>📋 复制</button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className={`mt-6 text-center text-xs ${textSecondary}`}>
          <div className="flex items-center justify-center gap-4 mb-2">
            <a href="#" className="text-[#007AFF] hover:underline">GitHub</a>
            <a href="#" className="text-[#007AFF] hover:underline">Demo</a>
            <span>v2.3.2</span>
          </div>
          <p className={textSecondary}>DNS Shield — 路由器级广告过滤规则生成工具</p>
        </footer>
      </div>

      {/* 移动端预览指示 */}
      <div className={`fixed bottom-4 right-4 ${cardBg} border ${borderColor} rounded-lg shadow-lg p-3 text-xs max-w-[200px]`}>
        <div className="font-medium mb-1">📱 响应式适配</div>
        <div className={textSecondary}>桌面端双栏布局，移动端自动切换为单栏堆叠布局</div>
      </div>
    </div>
  );
}
