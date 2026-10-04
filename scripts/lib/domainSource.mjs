// scripts/lib/domainSource.mjs v3.10.1
// 解析 public/domains.txt 单一数据源为统一中间结构。
// 语法约定：纯域名 = 黑名单；`+domain` = 白名单；`@domain=ip` = 自定义 DNS；`#` 开头 = 注释。
// 纯函数，无副作用，便于独立测试。

/**
 * 解析统一域名数据源文本。
 * @param {string} raw domains.txt 原始文本
 * @returns {{blockedDomains: string[], whitelist: string[], customDns: {domain: string, ip: string}[]}}
 */
export function parseDomainSource(raw) {
  const blacklist = [];
  const whitelist = [];
  const customDns = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('+')) {
      const d = trimmed.slice(1).trim();
      if (d) whitelist.push(d);
    } else if (trimmed.startsWith('@')) {
      const eq = trimmed.indexOf('=');
      if (eq > 1) {
        const domain = trimmed.slice(1, eq).trim();
        const ip = trimmed.slice(eq + 1).trim();
        if (domain && ip) customDns.push({ domain, ip });
      }
    } else if (/^[a-z0-9]/.test(trimmed)) {
      blacklist.push(trimmed);
    }
  }

  // 黑名单剔除白名单域名，保证「白名单优先」语义
  const whitelistSet = new Set(whitelist);
  const blockedDomains = blacklist.filter((d) => !whitelistSet.has(d));

  return { blockedDomains, whitelist, customDns };
}
