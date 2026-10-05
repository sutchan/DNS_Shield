// scripts/gen-format-files.mjs v3.11.2
// 预生成全部过滤规则的静态产出文件，生成逻辑与 src/utils/formatGenerators.ts 保持 1:1 对齐。
// 单一数据源：public/domains.txt（纯域名=黑名单，`+domain`=白名单，`@domain=ip`=自定义 DNS）。
// 产出（不含 domains.txt 数据源本身）：
//   dnsmasq.conf / hosts.txt / adguard.txt / whitelist.txt / unbound.conf / pihole.txt /
//   rpz.db / smartdns.conf / mosdns_domain_set.txt / clash_dns.yaml / coredns_hosts.txt
// 用法：
//   node scripts/gen-format-files.mjs              # 重新生成全部产物
//   node scripts/gen-format-files.mjs --list-files # 仅输出产物清单（供 CI / Release 消费，不写文件）
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

// 默认设置：读取 src/config/defaults.json（与前端 useSettings 共用的唯一来源）。
// 历史问题：本文件曾内联一份 settings 且 ipv4 写成 0.0.0.0，与前端的 127.0.0.1 冲突。
const defaults = JSON.parse(readFileSync(join(root, 'src', 'config', 'defaults.json'), 'utf8'));
const settings = { ...defaults };

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

// 产物清单 = 数据源 domains.txt + 全部格式文件。
// Release / CI 一律消费本清单，避免"新增格式却漏改 workflow 资产列表"的历史问题。
const ARTIFACT_FILES = ['domains.txt', ...Object.values(OUTPUT_FILES)];

// --list-files：只打印清单（每行一个 public/ 相对路径），不生成、不修改任何文件
if (process.argv.includes('--list-files')) {
  for (const file of ARTIFACT_FILES) console.log(`public/${file}`);
  process.exit(0);
}

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
