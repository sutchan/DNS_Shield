// scripts/lib/formatHeaders.mjs v3.15.0
// 各输出格式的头部注释文案与统一头部生成器，对齐 src/utils/headerConfigs.ts。
// 说明：Mosdns / Clash Meta / CoreDNS 为 v3.10.0 新增格式。
// v3.15.0：补齐用法说明（usage）行并逐行加注释符，与运行时 generateHeader 对齐
//（此前 usage 缺失或未加注释符，会使 dnsmasq/unbound 拒绝加载）。

export const HEADER_TITLES = {
  dnsmasq: 'Dnsmasq 广告过滤列表',
  hosts: 'Hosts 广告过滤列表',
  adguard: 'AdGuard 广告过滤规则',
  unbound: 'Unbound 广告过滤列表',
  pihole: 'Pi-hole 广告过滤列表',
  bind: 'Bind RPZ 响应策略区',
  smartdns: 'SmartDNS 广告过滤列表',
  mosdns: 'Mosdns domain-set 广告过滤列表',
  clash: 'Clash Meta DNS 广告过滤规则',
  coredns: 'CoreDNS hosts 广告过滤列表',
};

export const HEADER_DESCS = {
  dnsmasq: '路由器级广告过滤列表',
  hosts: '路由器级广告过滤 hosts 文件',
  adguard: '兼容 AdGuard 的广告过滤规则',
  unbound: '路由器级广告过滤列表（local-zone refuse）',
  pihole: '路由器级广告过滤列表（0.0.0.0 gravity）',
  bind: '路由器级广告过滤响应策略区（RPZ）',
  smartdns: '路由器级广告过滤列表（address /domain/#）',
  mosdns: 'Mosdns domain-set 列表（domain: 前缀匹配域名与子域）',
  clash: 'Clash Meta DNS 规则（DOMAIN-SUFFIX 命中后 reject）',
  coredns: 'CoreDNS hosts 插件格式（0.0.0.0 域名）',
};

/** 各格式注释前缀：AdGuard 用 `!`，Bind RPZ 用 `;`，其余（含 YAML 的 Clash）用 `#` */
export const COMMENT = {
  dnsmasq: '#',
  hosts: '#',
  adguard: '!',
  unbound: '#',
  pihole: '#',
  bind: ';',
  smartdns: '#',
  mosdns: '#',
  clash: '#',
  coredns: '#',
};

/** 各格式用法说明（与 src/locales/zh-cn.json 的 header.*Usage 对齐） */
export const USAGE = {
  dnsmasq: ['使用方法:', '- 梅林: 软件中心 -> DNS 设置', '- OpenWrt: 服务 -> DHCP 和 DNS'],
  hosts: ['使用方法: 导入到路由器广告过滤设置'],
  adguard: [],
  unbound: ['使用方法: 将内容追加到 unbound.conf，并 reload'],
  pihole: ['使用方法: 作为广告列表添加到 Group Management -> Adlists'],
  domains: ['使用方法: 直接粘贴为域名黑名单'],
  bind: ['使用方法: 作为 RPZ 区域文件加载 (type master, file rpz.db)'],
  smartdns: ['使用方法: 追加到 smartdns.conf'],
  mosdns: ['用法：包含于 Mosdns rule-set / domain-set'],
  clash: ['用法：追加到 Clash Meta DNS ruleset'],
  coredns: ['用法：经 CoreDNS hosts 插件加载'],
};

/**
 * 生成统一头部注释块。
 * @param {string} format 格式键
 * @param {{version: string, dateStr: string, domainCount: number, whitelistCount: number}} meta 头部元信息
 * @returns {string} 头部文本（以空行结尾，便于与规则正文分隔）
 */
export function buildHeader(format, { version, dateStr, domainCount, whitelistCount }) {
  const c = COMMENT[format];
  const sep = c === '!' ? '='.repeat(36) : '='.repeat(37);
  const lines = [];

  lines.push(`${c} ${sep}`);
  lines.push(`${c} DNS Shield - ${HEADER_TITLES[format]}`);
  lines.push(`${c} ${sep}`);
  lines.push(`${c}`);
  lines.push(`${c} ${HEADER_DESCS[format]}`);
  lines.push(`${c}`);
  lines.push(`${c} 版本:: ${version}`);
  lines.push(`${c} 更新:: ${dateStr}`);
  lines.push(`${c} 域名:: ${domainCount} 个唯一域名`);
  if (whitelistCount > 0) {
    lines.push(`${c} 白名单:: ${whitelistCount} 个域名`);
  }
  lines.push(`${c}`);
  // 用法说明逐行加注释符：否则 dnsmasq/unbound 会因「未知指令」拒绝加载（T-P1-10）
  for (const usageLine of USAGE[format] || []) {
    if (usageLine.trim()) lines.push(`${c} ${usageLine.trim()}`);
  }
  lines.push(`${c} 项目: https://github.com/sutchan/DNS_Shield`);
  lines.push(`${c} 演示: https://dns.ewuse.com/`);
  lines.push(`${c}`);
  lines.push(`${c} ${sep}`);

  return lines.join('\n') + '\n\n';
}
