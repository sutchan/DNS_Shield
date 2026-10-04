// scripts/lib/formatRules.mjs v3.10.0
// 各输出格式的规则行生成逻辑，与 src/utils/formatGenerators.ts 1:1 对齐。
// 纯函数：接收统一中间结构与设置，返回规则行数组（不含头部）。

/** 黑名单拦截规则 */
function blockedRules(format, domains, settings) {
  const out = [];
  for (const domain of domains) {
    switch (format) {
      case 'dnsmasq':
        out.push(`address=/${domain}/${settings.ipv4}`);
        if (settings.blockIPv6) out.push(`address=/${domain}/${settings.ipv6}`);
        break;
      case 'hosts':
        out.push(`${settings.ipv4} ${domain}`);
        if (settings.blockIPv6) out.push(`${settings.ipv6} ${domain}`);
        break;
      case 'adguard':
        out.push(`||${domain}^`);
        break;
      case 'unbound':
        out.push(`local-zone: "${domain}" refuse`);
        break;
      case 'pihole':
        out.push(`0.0.0.0 ${domain}`);
        break;
      case 'bind':
        out.push(`${domain} CNAME .`);
        out.push(`*.${domain} CNAME .`);
        break;
      case 'smartdns':
        out.push(`address /${domain}/#`);
        break;
      case 'mosdns':
        out.push(`domain:${domain}`);
        break;
      case 'clash':
        out.push(`DOMAIN-SUFFIX,${domain},reject`);
        break;
      case 'coredns':
        out.push(`0.0.0.0 ${domain}`);
        if (settings.blockIPv6) out.push(`${settings.ipv6} ${domain}`);
        break;
      default:
        break;
    }
  }
  return out;
}

/** 自定义 DNS 规则（仅部分格式具有改道语义；unbound/bind/mosdns/clash 无对应语法故跳过） */
function customDnsRules(format, items) {
  const out = [];
  for (const { domain, ip } of items) {
    switch (format) {
      case 'dnsmasq':
        out.push(`address=/${domain}/${ip}`);
        break;
      case 'hosts':
        out.push(`${ip} ${domain}`);
        break;
      case 'adguard':
        out.push(`||${domain}^`);
        break;
      case 'pihole':
        out.push(`${ip} ${domain}`);
        break;
      case 'smartdns':
        out.push(`server /${domain}/${ip}`);
        break;
      case 'coredns':
        out.push(`${ip} ${domain}`);
        break;
      default:
        break;
    }
  }
  return out;
}

/** 白名单段：仅对支持白名单语义的格式输出豁免规则，其余以注释标注 */
function whitelistSection(format, domains, settings) {
  if (domains.length === 0) return [];
  const out = [];
  const title = '白名单 (允许这些域名)';

  switch (format) {
    case 'dnsmasq':
      out.push(`\n# ${title}`);
      domains.forEach((d) => out.push(`server=/${d}/`));
      break;
    case 'hosts':
      out.push(`\n# ${title}`);
      out.push('# hosts 原生不支持白名单语法，仅作参考标注');
      domains.forEach((d) => out.push(`# 白名单 ${d}`));
      break;
    case 'adguard':
      if (settings.adguardIncludeWhitelist) {
        out.push(`\n! ${title}`);
        domains.forEach((d) => out.push(`@@||${d}^`));
      }
      break;
    case 'unbound':
      out.push(`\n# ${title}`);
      domains.forEach((d) => out.push(`local-zone: "${d}" transparent`));
      break;
    case 'clash':
      // Clash Meta：DIRECT 绕过拦截，等价于白名单放行
      out.push(`\n# ${title}`);
      domains.forEach((d) => out.push(`DOMAIN-SUFFIX,${d},DIRECT`));
      break;
    case 'pihole':
    case 'bind':
    case 'smartdns':
    case 'mosdns':
    case 'coredns':
      out.push(`\n# ${title}`);
      domains.forEach((d) => out.push(`# 白名单 ${d}`));
      break;
    default:
      break;
  }
  return out;
}

/**
 * 生成指定格式的规则行（不含头部）。
 * @param {string} format 格式键
 * @param {{blockedDomains: string[], whitelist: string[], customDns: {domain: string, ip: string}[]}} data 中间结构
 * @param {object} settings 生成设置
 * @returns {string[]}
 */
export function generateRules(format, data, settings) {
  return [
    ...blockedRules(format, data.blockedDomains, settings),
    ...customDnsRules(format, data.customDns),
    ...whitelistSection(format, data.whitelist, settings),
  ];
}
