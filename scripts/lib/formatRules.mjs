// scripts/lib/formatRules.mjs v3.22.4
// 各输出格式的规则行生成逻辑，与 src/utils/formatGenerators.ts 1:1 对齐。
// 纯函数：接收统一中间结构与设置，返回规则行数组（不含头部）。
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// T-AUD-M15：黑名单/自定义 DNS 规则行与运行时共用单一实现，杜绝两份 switch 漂移。
import { blockedRuleLines, customDnsRuleLine } from '../../src/utils/ruleLines.ts';

// L-07：构建产物注释与运行时 i18n 共用 zh-cn 文案，杜绝两处措辞长期漂移。
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ZH_CN = JSON.parse(readFileSync(resolve(ROOT, 'src/locales/zh-cn.json'), 'utf8'));
const WHITELIST_TITLE = ZH_CN.whitelist.title;
const HOSTS_NOTE = ZH_CN.whitelist.hostsNote;

const linesOf = (text) => (text ? text.slice(0, -1).split('\n') : []);

/** 黑名单拦截规则（共享实现） */
function blockedRules(format, domains, settings) {
  const out = [];
  for (const domain of domains) out.push(...linesOf(blockedRuleLines(format, domain, settings)));
  return out;
}

/** 自定义 DNS 规则（共享实现；无对应语法的格式返回空数组） */
function customDnsRules(format, items) {
  const out = [];
  for (const { domain, ip } of items) {
    const line = customDnsRuleLine(format, domain, ip);
    if (line) out.push(line.slice(0, -1));
  }
  return out;
}

/** 白名单段：仅对支持白名单语义的格式输出豁免规则，其余以注释标注 */
function whitelistSection(format, domains, settings) {
  if (domains.length === 0) return [];
  const out = [];
  const title = WHITELIST_TITLE;

  switch (format) {
    case 'dnsmasq':
      out.push(`\n# ${title}`);
      domains.forEach((d) => out.push(`server=/${d}/`));
      break;
    case 'hosts':
      out.push(`\n# ${title}`);
      out.push(`# ${HOSTS_NOTE}`);
      domains.forEach((d) => out.push(`# ${title} ${d}`));
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
