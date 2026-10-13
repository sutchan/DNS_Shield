// scripts/aggregate-upstream.mjs
// 定时聚合上游广告/追踪拦截规则源，提取域名并与 public/domains.txt 合并去重。
// 设计原则：
//   - 多源容错：任一源失败不影响整体（跳过并继续）。
//   - 仅提取黑名单域名（跳过 @@ 白名单、注释、IP 直连行）。
//   - 合并后保持小写、去重、按字母升序排序，写回 public/domains.txt。
//   - 仅在确有新增/变化时写文件，并返回新增数量供 CI 判断。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOMAINS_FILE = resolve(ROOT, 'public/domains.txt');

// 上游黑名单源（公开、稳定、含广告/追踪域名）。可按需增删。
// key 为分类标识，必须与前端 src/utils/domainCategory.ts 的 CategoryKey 一致。
const SOURCES = [
  { key: 'adguard', url: 'https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/BaseFilter/sections/adblock.txt' },
  { key: 'easylist', url: 'https://easylist.to/easylist/easylist.txt' },
  { key: 'neohosts', url: 'https://raw.githubusercontent.com/neoFelhz/neohosts/master/dist/neohosts-full.txt' },
  { key: 'stevenblack', url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts' },
  { key: 'youslist', url: 'https://raw.githubusercontent.com/yous/YousList/master/youslist.txt' },
];
// 分类索引产物：每行 "<source> <domain>"，记录域名真实命中的上游源，供前端按类筛选。
const CATEGORY_INDEX_FILE = resolve(ROOT, 'public/category-index.txt');
// 索引中源的固定输出顺序（保证产物稳定，便于 diff 审查）。
const SOURCE_ORDER = SOURCES.map((s) => s.key);

const FETCH_TIMEOUT_MS = 30_000;

/** 从单行规则提取域名（兼容 hosts / adblock / 纯域名 多种格式） */
function extractDomain(line) {
  const raw = line.trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('!') || raw.startsWith('//')) return null;
  // 白名单例外跳过
  if (raw.startsWith('@@')) return null;

  let candidate = raw;
  // AdGuard / Adblock Plus: ||domain^ 或 ||domain^$opt
  const abMatch = candidate.match(/\|\|([a-z0-9-*_.-]+)\^/i);
  if (abMatch) candidate = abMatch[1];
  // hosts 格式: 0.0.0.0 domain 或 127.0.0.1 domain
  const hostsMatch = candidate.match(/^\d{1,3}(\.\d{1,3}){3}\s+([a-z0-9-*_.-]+)/i);
  if (hostsMatch) candidate = hostsMatch[2];
  // 去除行内注释
  candidate = candidate.split('#')[0].split('!')[0].trim();
  // 仅保留合法域名（含点、字母数字、连字符、可选前导 *. 通配）
  const domain = candidate.replace(/^\*\./, '').toLowerCase();
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return domain;
  }
  return null;
}

async function fetchDomains(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!res.ok) {
      console.warn(`  ✗ 跳过（HTTP ${res.status}）: ${url}`);
      return new Set();
    }
    const text = await res.text();
    const set = new Set();
    for (const line of text.split('\n')) {
      const d = extractDomain(line);
      if (d) set.add(d);
    }
    console.log(`  ✓ 提取 ${set.size} 个候选域名: ${url}`);
    return set;
  } catch (err) {
    console.warn(`  ✗ 跳过（${err.name}）: ${url}`);
    return new Set();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log('开始聚合上游拦截规则源…');
  const merged = new Set();

  // 保留现有域名（优先，避免误删人工精选条目）
  if (existsSync(DOMAINS_FILE)) {
    for (const line of readFileSync(DOMAINS_FILE, 'utf8').split('\n')) {
      const d = extractDomain(line);
      if (d) merged.add(d);
    }
  }
  const before = merged.size;

  // 分类索引：记录每个域名真实命中的上游源（一个域名可命中多个源）
  const categoryIndex = new Map();
  const recordCategory = (key, domains) => {
    for (const d of domains) {
      const bucket = categoryIndex.get(d);
      if (bucket) {
        bucket.add(key);
      } else {
        categoryIndex.set(d, new Set([key]));
      }
    }
  };

  for (const source of SOURCES) {
    const set = await fetchDomains(source.url);
    recordCategory(source.key, set);
    for (const d of set) merged.add(d);
  }

  const sorted = [...merged].sort();
  const after = sorted.length;
  const added = after - before;

  if (added > 0) {
    writeFileSync(DOMAINS_FILE, sorted.join('\n') + '\n', 'utf8');
    console.log(`合并完成：原 ${before} → 现 ${after}（新增 ${added}）`);
    process.stdout.write(`ADDED=${added}\n`);
  } else {
    console.log(`无需更新：已是最新（${after} 个域名）`);
    process.stdout.write('ADDED=0\n');
  }

  // 分类索引每次运行都重写：即使域名总量无变化，上游命中关系也可能变化，
  // 从而保证前端按类筛选始终基于最新真实数据。
  const indexLines = [];
  for (const domain of sorted) {
    const hits = categoryIndex.get(domain);
    if (!hits) continue;
    for (const key of SOURCE_ORDER) {
      if (hits.has(key)) indexLines.push(`${key} ${domain}`);
    }
  }
  writeFileSync(CATEGORY_INDEX_FILE, indexLines.join('\n') + '\n', 'utf8');
  console.log(`分类索引已更新：${indexLines.length} 条 → ${CATEGORY_INDEX_FILE}`);
}

main().catch((err) => {
  console.error('聚合失败：', err);
  process.exit(1);
});
