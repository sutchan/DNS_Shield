// src/utils/domainPrimitives.ts v3.22.0
// 域名/IP 校验与规范化原始能力，供 domainValidator 编排及各格式解析器复用。
// 解析结果类型 ParseResult/ParseStats 统一在 types/formats.ts 定义，此处仅做类型引用。

// 域名正则表达式（允许可选通配符前缀 *.，供 RPZ 等格式保留子域通配语义）
const DOMAIN_REGEX = /^(?:\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

// IP 地址校验（IPv4 / IPv6）
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/**
 * IPv6 校验（T-AUD-M06）：正则无法正确覆盖 `::` 压缩与内嵌 IPv4，
 * 会拒绝 `2001:db8::8a2e:370:7334`、`::ffff:192.0.2.1` 等合法地址。
 * 规则：最多一个 `::`；按组拆分后每组 1~4 位十六进制；
 * 尾部 IPv4 折算 2 组；无压缩时必须恰好 8 组，有压缩时少于 8 组。
 */
export const isValidIpv6 = (ip: string): boolean => {
  if (!ip || ip.includes(':::') || ip.split('::').length > 2) return false;
  let tail = ip;
  let ipv4Groups = 0;
  const ipv4Match = tail.match(/:((?:\d{1,3}\.){3}\d{1,3})$/);
  if (ipv4Match) {
    if (!IPV4_REGEX.test(ipv4Match[1])) return false;
    ipv4Groups = 2;
    tail = tail.slice(0, -ipv4Match[1].length - 1);
    if (tail === '') return true; // `::ffff:192.0.2.1` 之类的纯压缩前缀
  }
  const compressed = tail.includes('::');
  const [left = '', right = ''] = tail.split('::');
  const groups = [
    ...(left ? left.split(':') : []),
    ...(right ? right.split(':') : []),
  ];
  if (groups.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group))) return false;
  const total = groups.length + ipv4Groups;
  return compressed ? total < 8 : total === 8;
};

// 验证域名格式
export const isValidDomain = (domain: string): boolean => {
  return DOMAIN_REGEX.test(domain);
};

export const isValidIp = (ip: string): boolean => {
  return IPV4_REGEX.test(ip) || isValidIpv6(ip);
};

// 规范化域名（仅转小写，保留可选通配符前缀 *.，由 settings.removeWildcard 决定去留）
export const normalizeDomain = (domain: string): string => {
  return domain.toLowerCase();
};
