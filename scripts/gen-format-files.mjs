// scripts/gen-format-files.mjs v3.10.0
// 预生成全部过滤规则的静态产出文件，生成逻辑与 src/utils/formatGenerators.ts 保持 1:1 对齐。
// 单一数据源：public/domains.txt（纯域名=黑名单，`+domain`=白名单，`@domain=ip`=自定义 DNS）。
// 产出（不含 domains.txt 数据源本身）：
//   dnsmasq.conf / hosts.txt / adguard.txt / whitelist.txt / unbound.conf / pihole.txt /
//   rpz.db / smartdns.conf / mosdns_domain_set.txt / clash_dns.yaml / coredns_hosts.txt
// 用法：node scripts/gen-format-files.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDomainSource } from './lib/domainSource.mjs';
import { buildHeader } from './lib/formatHeaders.mjs';
import { generateRules } from './lib/formatRules.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 版本号单一来源：package.json
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
  mosdnsFilename: 'mosdns_domain_set.txt',
  clashFilename: 'clash_dns.yaml',
  corednsFilename: 'coredns_hosts.txt',
};

// 解析单一数据源
const data = parseDomainSource(readFileSync(join(root, 'public', 'domains.txt'), 'utf8'));
const meta = {
  version: VERSION,
  dateStr,
  domainCount: data.blockedDomains.length,
  whitelistCount: data.whitelist.length,
};

// 格式键 → 产出文件名
const OUTPUT_FILES = {
  dnsmasq: settings.dnsmasqFilename,
  hosts: settings.hostsFilename,
  adguard: settings.adguardFilename,
  whitelist: settings.whitelistFilename,
  unbound: settings.unboundFilename,
  pihole: settings.piholeFilename,
  bind: settings.bindFilename,
  smartdns: settings.smartdnsFilename,
  mosdns: settings.mosdnsFilename,
  clash: settings.clashFilename,
  coredns: settings.corednsFilename,
};

/** 组装单个格式的完整文件内容（头部 + 规则正文） */
function buildFile(format) {
  // 白名单为独立导出文件：复用 AdGuard 头部，内容为纯 @@||domain^ 规则
  if (format === 'whitelist') {
    const head = settings.addHeader
      ? buildHeader('adguard', meta).replace('AdGuard 广告过滤规则', 'AdGuard 白名单')
      : '';
    const body = data.whitelist.length > 0
      ? data.whitelist.map((d) => `@@||${d}^`).join('\n') + '\n'
      : '';
    return head + body;
  }

  const head = settings.addHeader ? buildHeader(format, meta) : '';
  const body = generateRules(format, data, settings).join('\n') + '\n';
  return head + body;
}

for (const [format, filename] of Object.entries(OUTPUT_FILES)) {
  const content = buildFile(format);
  writeFileSync(join(root, 'public', filename), content, 'utf8');
  console.log(`生成 ${filename} (${content.split('\n').length} 行)`);
}

console.log(
  `完成：基于 domains.txt 生成 ${Object.keys(OUTPUT_FILES).length} 个格式文件，` +
  `${meta.domainCount} 个唯一域名，版本 ${VERSION}`
);
