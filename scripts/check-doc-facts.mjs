#!/usr/bin/env node
// scripts/check-doc-facts.mjs v3.22.4
// 文档事实自动化门禁（T-DOC-03）：从代码/脚本/测试权威源推导指标，核对活跃文档中的同类数字。
// 冻结快照（CHANGELOG 历史段、tasks-done、STRUCTURE-REVIEW、AUDIT-REPORT、prototype）不参与校验。
// 用法：node scripts/check-doc-facts.mjs 或 npm run check:doc-facts
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, extname } from 'node:path';

const root = join(import.meta.dirname, '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const errors = [];

const activeDocs = [
  'README.md', 'README.en.md', 'DEPLOYMENT.md',
  'docs/README.md', 'docs/01-overview.md', 'docs/03-modules.md',
  'docs/04-api.md', 'docs/05-user-guide.md', 'docs/06-faq-troubleshooting.md',
  'docs/07-improvements.md', 'docs/SPEC.md', 'docs/tasks.md',
  'docs/CHECKLIST.md', 'docs/config.yaml', 'docs/openapi.yaml',
];

const walk = (dir, cb) => {
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (['node_modules', '.next', '.tmp', 'coverage', '.git'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else cb(p);
  }
};
const codeFiles = [];
for (const dir of ['src', 'scripts']) {
  walk(dir, (p) => { if (['.ts', '.tsx', '.js', '.mjs'].includes(extname(p))) codeFiles.push(p); });
}
const testFiles = codeFiles.filter((p) => /\.test\.(ts|tsx)$/.test(p));
const testSuites = testFiles.length;

// 测试指标以 Vitest JSON 报告为权威源；报告缺失或早于任一测试文件时重新生成。
const vitestJson = '.tmp/vitest.json';
const vitestPath = join(root, vitestJson);
const newestTest = Math.max(...testFiles.map((p) => statSync(join(root, p)).mtimeMs), 0);
const stale = !existsSync(vitestPath) || statSync(vitestPath).mtimeMs < newestTest;
if (stale) {
  mkdirSync(join(root, '.tmp'), { recursive: true });
  const r = spawnSync(process.execPath, [
    'node_modules/vitest/vitest.mjs', 'run',
    '--reporter=json', `--outputFile=${vitestJson}`, '--reporter=dot',
  ], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) errors.push(`Vitest JSON 采集失败：${(r.stderr || '').slice(-300)}`);
}
const vitest = existsSync(vitestPath) ? JSON.parse(read(vitestJson)) : {};
const testCases = Number(vitest.numTotalTests) || 0;

// 其余指标全部由仓库现有事实源推导，禁止手写期望值。
const baseline = JSON.parse(read('scripts/locale-baseline.json'));
const domains = read('public/domains.txt').split(/\r?\n/).reduce((acc, raw) => {
  const line = raw.trim();
  if (!line || line.startsWith('#')) return acc;
  if (line.startsWith('+')) acc.white += 1;
  else acc.block += 1;
  return acc;
}, { block: 0, white: 0 });
const domainTotal = domains.block + domains.white;

const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = typeof v;
  }
  return out;
};
const localeKeys = Object.keys(flatten(JSON.parse(read('src/locales/zh-cn.json')))).length;

const overLimit = codeFiles.filter((p) => {
  const text = read(p);
  const lines = (text.match(/\n/g) || []).length + (text.endsWith('\n') ? 0 : 1);
  return lines > 200;
}).length;
const syncRules = (read('scripts/sync-facts.mjs').match(/^\s*\['[^']+',/gm) || []).length;
const fmtText = read('src/types/formats.ts');
const fmtBlock = fmtText.slice(fmtText.indexOf('ALL_FORMATS'), fmtText.indexOf('];', fmtText.indexOf('ALL_FORMATS')));
const formats = (fmtBlock.match(/'[^']+'/g) || []).length;

const facts = {
  '套件/用例': `${testSuites} 套件 / ${testCases} 用例`,
  '域名总数': String(domainTotal),
  '语言键数': String(localeKeys),
  '版本展示位': String(syncRules),
  '超行源文件': String(overLimit),
  '输出格式数': String(formats),
};
const patterns = [
  ['套件/用例', /(\d+)\s*套件\s*\/\s*(\d+)\s*用例/g, (m) => `${m[1]} 套件 / ${m[2]} 用例`],
  ['域名总数', /(\d{3,7})\s*(?:条|个域名)/g, (m) => m[1]],
  ['语言键数', /(\d+)\s*(?:递归)?键/g, (m) => m[1]],
  ['版本展示位', /(\d+)\s*处(?:文档)?版本展示位/g, (m) => m[1]],
  ['超行源文件', /(\d+)\s*个(?:源文件)?(?:超|超过)\s*\d*\s*行/g, (m) => m[1]],
  ['输出格式数', /(\d+)\s*种(?:输出)?格式(?!产物)/g, (m) => m[1]],
];
const historical = /旧值|历史|曾|回退|未合入|旧记录|过去|原为|曾是|快照/;

for (const doc of activeDocs) {
  let text;
  try { text = read(doc); } catch { errors.push(`${doc}: 文件缺失`); continue; }
  const lines = text.split(/\r?\n/);
  for (const [name, re, make] of patterns) {
    for (const m of text.matchAll(re)) {
      const before = text.slice(0, m.index);
      const lineNo = before.split(/\r?\n/).length - 1;
      const line = lines[lineNo] || '';
      if (historical.test(line) || /^\|\s*v\d+\.\d+\.\d+\s*\|/.test(line) || /顶层\s*\d+\s*键/.test(line)) continue;
      const actual = make(m);
      if (actual !== facts[name]) errors.push(`${doc}:${lineNo + 1} ${name}=${actual}，权威值=${facts[name]}`);
    }
  }
}

const tasksText = read('docs/tasks.md');
for (const [name, value] of [
  ['套件/用例', facts['套件/用例']], ['域名总数', facts['域名总数']],
  ['语言键数', facts['语言键数']], ['版本展示位', facts['版本展示位']],
  ['超行源文件', facts['超行源文件']],
]) {
  if (!tasksText.includes(value)) errors.push(`docs/tasks.md: 缺少权威指标 ${name}=${value}`);
}
if (baseline.keyCount !== localeKeys) {
  errors.push(`locale-baseline.keyCount=${baseline.keyCount} 与 zh-cn 实算 ${localeKeys} 不一致`);
}
if (testSuites === 0 || testCases === 0) errors.push('Vitest 指标为 0，拒绝据此校验文档');

if (errors.length) {
  console.error('文档事实校验失败：');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(
  `文档事实校验通过：${testSuites} 套件 / ${testCases} 用例，${localeKeys} 键，` +
  `${domainTotal} 域名，${syncRules} 处展示位，${overLimit} 个超行源文件，${formats} 格式`
);
