// scripts/lib/formatHeaders.mjs v3.10.1
// 各输出格式的头部注释文案与统一头部生成器，对齐 src/utils/headerConfigs.ts。
// 说明：Mosdns / Clash Meta / CoreDNS 为 v3.10.0 新增格式。

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

/** 各格式注释前缀：AdGuard 用 `!`，其余（含 YAML 的 Clash）用 `#` */
export const COMMENT = {
  dnsmasq: '#',
  hosts: '#',
  adguard: '!',
  unbound: '#',
  pihole: '#',
  bind: '#',
  smartdns: '#',
  mosdns: '#',
  clash: '#',
  coredns: '#',
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
  lines.push(`${c} 项目: https://github.com/sutchan/DNS_Shield`);
  lines.push(`${c} 演示: https://dns.ewuse.com/`);
  lines.push(`${c}`);
  lines.push(`${c} ${sep}`);

  return lines.join('\n') + '\n\n';
}
