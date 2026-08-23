// src/utils/domainPrimitives.ts v3.8.1
// 域名/IP 校验与规范化原始能力，供 domainValidator 编排及各格式解析器复用。
// 解析结果类型 ParseResult/ParseStats 统一在 types/formats.ts 定义，此处仅做类型引用。

// 域名正则表达式（允许可选通配符前缀 *.，供 RPZ 等格式保留子域通配语义）
const DOMAIN_REGEX = /^(?:\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

// IP 地址校验（IPv4 / IPv6）
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;

// 验证域名格式
export const isValidDomain = (domain: string): boolean => {
  return DOMAIN_REGEX.test(domain);
};

export const isValidIp = (ip: string): boolean => {
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
};

// 规范化域名（仅转小写，保留可选通配符前缀 *.，由 settings.removeWildcard 决定去留）
export const normalizeDomain = (domain: string): string => {
  return domain.toLowerCase();
};
