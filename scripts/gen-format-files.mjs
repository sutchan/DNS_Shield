// scripts/gen-format-files.mjs v3.7.53
// 预生成 9 种过滤规则的静态产出文件，对齐 src/utils/formatGenerators.ts 的生成逻辑。
// 单一数据源：public/domains.txt（纯域名=黑名单，`+domain`=白名单，`@domain=ip`=自定义 DNS）。
// 产出（不含 domains.txt 数据源本身）：
//   dnsmasq.conf / hosts.txt / adguard.txt / whitelist.txt / unbound.conf / pihole.txt / rpz.db / smartdns.conf
// 用法：node scripts/gen-format-files.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// 读取当前版本（单一来源：package.json），保证产出文件头注释与新版本一致
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const VERSION = pkg.version;

const now = new Date();
const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

// 默认设置（与 src/hooks/useSettings.ts DEFAULT_SETTINGS 对齐）
const settings = {
  ipv4: '0.0.0.0',
  ipv6: '::',
  blockIPv6: false,
  addHeader: true,
  adguardIncludeWhitelist: true,
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt',
  unboundFilename: 'unbound.conf',
  piholeFilename: 'pihole.txt',
  bindFilename: 'rpz.db',
  smartdnsFilename: 'smartdns.conf',
};

// ---- 解析数据源 ----
const raw = readFileSync(join(root, 'public', 'domains.txt'), 'utf8');
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

const whitelistSet = new Set(whitelist);
const blockedDomains = blacklist.filter((d) => !whitelistSet.has(d));

// ---- 各格式头部文案 ----
const HEADER_TITLES = {
  dnsmasq: 'Dnsmasq 广告过滤列表',
  hosts: 'Hosts 广告过滤列表',
  adguard: 'AdGuard 广告过滤规则',
  unbound: 'Unbound 广告过滤列表',
  pihole: 'Pi-hole 广告过滤列表',
  bind: 'Bind RPZ 响应策略区',
  smartdns: 'SmartDNS 广告过滤列表',
};
const HEADER_DESCS = {
  dnsmasq: '路由器级广告过滤列表',
  hosts: '路由器级广告过滤 hosts 文件',
  adguard: '兼容 AdGuard 的广告过滤规则',
  unbound: '路由器级广告过滤列表（local-zone refuse）',
  pihole: '路由器级广告过滤列表（0.0.0.0 gravity）',
  bind: '路由器级广告过滤响应策略区（RPZ）',
  smartdns: '路由器级广告过滤列表（address /domain/#）',
};
const COMMENT = { dnsmasq: '#', hosts: '#', adguard: '!', unbound: '#', pihole: '#', bind: '#', smartdns: '#' };

function buildHeader(format) {
  const c = COMMENT[format];
  const sep = c === '!' ? '='.repeat(36) : '='.repeat(37);
  const lines = [];
  lines.push(`${c} ${sep}`);
  lines.push(`${c} DNS Shield - ${HEADER_TITLES[format]}`);
  lines.push(`${c} ${sep}`);
  lines.push(`${c}`);
  lines.push(`${c} ${HEADER_DESCS[format]}`);
  lines.push(`${c}`);
  lines.push(`${c} 版本:: ${VERSION}`);
  lines.push(`${c} 更新:: ${dateStr}`);
  lines.push(`${c} 域名:: ${blockedDomains.length} 个唯一域名`);
  if (whitelist.length > 0) {
    lines.push(`${c} 白名单:: ${whitelist.length} 个域名`);
  }
  lines.push(`${c}`);
  lines.push(`${c} 项目: https://github.com/sutchan/DNS_Shield`);
  lines.push(`${c} 演示: https://dns.ewuse.com/`);
  lines.push(`${c}`);
  lines.push(`${c} ${sep}`);
  return lines.join('\n') + '\n\n';
}

// ---- 生成各格式规则 ----
function generate(format) {
  const out = [];
  if (settings.addHeader) out.push(buildHeader(format));

  // 黑名单规则
  for (const domain of blockedDomains) {
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
    }
  }

  // 自定义 DNS（dnsmasq/hosts/adguard/pihole/smartdns 生效；unbound/bind 无黑洞语义跳过）
  for (const { domain, ip } of customDns) {
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
    }
  }

  // 白名单段（仅对支持白名单语义的格式输出豁免/注释）
  if (whitelist.length > 0) {
    const title = '白名单 (允许这些域名)';
    const pushWl = (s) => out.push(s);
    switch (format) {
      case 'dnsmasq':
        pushWl(`\n# ${title}`);
        whitelist.forEach((d) => pushWl(`server=/${d}/`));
        break;
      case 'hosts':
        pushWl(`\n# ${title}`);
        pushWl('# hosts 原生不支持白名单语法，仅作参考标注');
        whitelist.forEach((d) => pushWl(`# 白名单 ${d}`));
        break;
      case 'adguard':
        if (settings.adguardIncludeWhitelist) {
          pushWl(`\n! ${title}`);
          whitelist.forEach((d) => pushWl(`@@||${d}^`));
        }
        break;
      case 'unbound':
        pushWl(`\n# ${title}`);
        whitelist.forEach((d) => pushWl(`local-zone: "${d}" transparent`));
        break;
      case 'pihole':
        pushWl(`\n# ${title}`);
        whitelist.forEach((d) => pushWl(`# 白名单 ${d}`));
        break;
      case 'bind':
        pushWl(`\n# ${title}`);
        whitelist.forEach((d) => pushWl(`# 白名单 ${d}`));
        break;
      case 'smartdns':
        pushWl(`\n# ${title}`);
        whitelist.forEach((d) => pushWl(`# 白名单 ${d}`));
        break;
    }
  }

  return out.join('\n') + '\n';
}

// ---- 写入产出文件 ----
const OUTPUT_FILES = {
  dnsmasq: settings.dnsmasqFilename,
  hosts: settings.hostsFilename,
  adguard: settings.adguardFilename,
  whitelist: settings.whitelistFilename,
  unbound: settings.unboundFilename,
  pihole: settings.piholeFilename,
  bind: settings.bindFilename,
  smartdns: settings.smartdnsFilename,
};

// 白名单格式单独成文件（纯 @@||domain^ 规则）
const whitelistContent = (settings.addHeader ? buildHeader('adguard').replace('AdGuard 广告过滤规则', 'ADGuard 白名单') : '') +
  (whitelist.length > 0 ? whitelist.map((d) => `@@||${d}^`).join('\n') + '\n' : '');

for (const [format, filename] of Object.entries(OUTPUT_FILES)) {
  let content;
  if (format === 'whitelist') {
    content = whitelistContent;
  } else {
    content = generate(format);
  }
  const target = join(root, 'public', filename);
  writeFileSync(target, content, 'utf8');
  console.log(`生成 ${filename} (${content.split('\n').length} 行)`);
}

console.log(`完成：基于 domains.txt 生成 ${Object.keys(OUTPUT_FILES).length} 个格式文件，版本 ${VERSION}`);
