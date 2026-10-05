// scripts/sync-facts.mjs v3.12.0
// 事实同步脚本：把 package.json 的 version 写入所有文档展示位。
// 存在理由：版本号曾分散在 40+ 处手工维护（README 徽章、DEPLOYMENT、SPEC、config.yaml 等），
// 每次 bump 都要手工逐处改，极易漏改（历史上 prototype/ 停在 3.9.3、DEPLOYMENT 停在 3.8.8）。
// 用法：
//   node scripts/sync-facts.mjs            # 写入
//   node scripts/sync-facts.mjs --check    # 只校验（CI 用；发现不一致以非零码退出）
// 故意不覆盖：CHANGELOG.md（历史记录不可篡改）、prototype/**（设计快照，已冻结）、
//            public/** 产物头部（由 gen-format-files.mjs 负责）、src/** 文件头注释（仅被改文件更新）。
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;

// 每条规则：文件 + 匹配旧值的正则（带捕获组）+ 替换模板
const RULES = [
  ['README.md', /(\[![^\]]*Version\]\(https:\/\/img\.shields\.io\/badge\/version-)[0-9.]+(-green\))/g, `$1${version}$2`],
  ['README.md', /(当前版本：v)[0-9.]+/g, `$1${version}`],
  ['README.en.md', /(\[![^\]]*Version\]\(https:\/\/img\.shields\.io\/badge\/version-)[0-9.]+(-green\))/g, `$1${version}$2`],
  ['DEPLOYMENT.md', /(> 当前版本：v)[0-9.]+/g, `$1${version}`],
  ['DEPLOYMENT.md', /(\| `NEXT_PUBLIC_APP_VERSION` \|[^\n]*\| )[0-9.]+( \|)/g, `$1${version}$2`],
  ['DEPLOYMENT.md', /(version: ')[0-9.]+(')/g, `$1${version}$2`],
  ['docs/SPEC.md', /(> 最后审查：[^\n]*与 package\.json v)[0-9.]+( 对齐)/g, `$1${version}$2`],
  ['docs/SPEC.md', /(\| 当前版本 \| v)[0-9.]+( \|)/g, `$1${version}$2`],
  ['docs/SPEC.md', /(\| 版本号 \| )[0-9.]+( \|)/g, `$1${version}$2`],
  ['docs/config.yaml', /(version: ")[0-9.]+(")/g, `$1${version}$2`],
  ['docs/tasks.md', /(> 最后审查：[^\n]*与 package\.json v)[0-9.]+( 对齐)/g, `$1${version}$2`],
  ['docs/tasks.md', /(\| 应用版本 \| v)[0-9.]+( \|)/g, `$1${version}$2`],
  ['docs/CHECKLIST.md', /(> 最后审查：[^\n]*与 package\.json v)[0-9.]+( 对齐)/g, `$1${version}$2`],
];

const drift = [];
for (const [file, pattern, template] of RULES) {
  const path = join(root, file);
  const before = readFileSync(path, 'utf8');
  const matches = before.match(pattern);
  if (!matches) {
    drift.push(`${file}: 未匹配到任何版本展示位（规则可能已失效，需更新脚本）`);
    continue;
  }
  const after = before.replace(pattern, template);
  if (after === before) continue;
  if (checkOnly) {
    drift.push(`${file}: ${matches.length} 处版本号与 package.json(${version}) 不一致 -> ${matches[0].slice(0, 60)}`);
  } else {
    writeFileSync(path, after, 'utf8');
    console.log(`sync ${file}: ${matches.length} 处 -> v${version}`);
  }
}

if (checkOnly && drift.length) {
  console.error('::error::文档版本展示位漂移，请执行 node scripts/sync-facts.mjs');
  for (const d of drift) console.error('  - ' + d);
  process.exit(1);
}
if (checkOnly) console.log(`所有文档版本展示位与 package.json(${version}) 一致`);
