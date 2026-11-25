#!/usr/bin/env node
// scripts/check-root-clean.mjs — 根目录清洁度门禁（白名单制）
//
// 规范：所有临时文件（一次性脚本、探针、运行日志、中间产物、缓存、下载文件）
// 统一存放于仓库根的 .tmp/ 子目录（已被 .gitignore 忽略），禁止在仓库根或
// 其他顶层位置散落。完整规范见 docs/TEMP-FILES.md。
// 本脚本在 CI 首步拦截：任何「未被白名单列举」的根级条目均视为违规。
import fs from 'node:fs';
import cp from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');

// 根目录合法条目白名单：
// 此集合覆盖「允许出现在根目录」的条目；被 .gitignore 忽略的环境文件
// （.env.local / .nvmdrc / .workbuddy）与临时产物不同，需单独按类型判定。
const ALLOWED = new Set([
  // 文件
  '.env.example', '.eslintrc.json', '.gitattributes', '.gitignore', '.npmrc',
  'CHANGELOG.md', 'DEPLOYMENT.md', 'DNS_Shield.code-workspace', 'edgeone.json',
  'LICENSE', 'next-env.d.ts', 'next.config.js', 'package.json',
  // 包管理器锁文件属于工程配置，不是临时产物；CI 以 package-lock.json 做 npm ci
  'package-lock.json', 'pnpm-lock.yaml',
  'postcss.config.js', 'README.en.md', 'README.md',
  'tailwind.config.js', 'tsconfig.json', 'vercel.json', 'vitest.config.ts',
  // 目录
  '.github', 'docs', 'openwrt-package', 'prototype', 'public', 'scripts', 'src',
]);

// 额外允许的模式（如 README.zh.md、tsconfig.app.json）
function isAllowedPattern(name) {
  return /^README(\.[a-z]{2})?\.md$/.test(name) || /^tsconfig\..*\.json$/.test(name);
}

// git 内部目录与环境类忽略文件（非「临时产物」，属开发环境状态）
const GIT_INTERNAL = new Set(['.git']);
const ENV_IGNORED = new Set(['.env.local', '.nvmdrc', '.workbuddy']);

function isIgnored(name) {
  try {
    // 统一为 POSIX 风格相对路径：Windows 下 path.join 产生反斜杠，
    // 会让 git check-ignore 的规则匹配不可靠。
    // 使用 spawnSync 参数数组（不经 shell），消除文件名含 shell 元字符时的注入风险，
    // 修复 docs/AUDIT-REPORT-v3.19.0.md H-01 / docs/07-improvements.md O-04。
    const rel = name.split(path.sep).join('/');
    const r = cp.spawnSync('git', ['check-ignore', '-q', rel], { cwd: ROOT, stdio: 'ignore' });
    return r.status === 0;
  } catch {
    return false;
  }
}

// 根目录临时产物特征（优先于 gitignore 跳过逻辑）：
// 这些文件即使被 .gitignore 兜底忽略（不会入库），也必须归位——
// 否则「忽略」会掩盖散落事实，门禁形同虚设。
const TEMP_PATTERNS = [
  /^_.*\.(mjs|cjs|js|mts|ts|tsx|txt|log|out|err)$/, // 临时脚本/日志（_ 前缀）
  /^preview\.(log|err|out|txt)$/,                   // 预览服务输出
  /^.*\.tsbuildinfo$/,                              // TypeScript 增量缓存
  /^.*\.(tmp|temp|swp|swo)$/,                       // 临时/编辑器交换文件
];
const TEMP_LOG_RE = /^_.*\.(txt|log|out|err)$/;

function tempReason(name) {
  if (/^_.*\.(mjs|cjs|js|mts|ts|tsx)$/.test(name)) return '临时脚本';
  if (TEMP_PATTERNS.some((re) => re.test(name))) return '临时产物';
  return null;
}

// 自动创建 .tmp/ 与约定子目录（幂等），确保临时文件有处可去。
try {
  cp.execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'manage-tmp.mjs'), '--init'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
} catch (e) {
  console.error('✗ 无法初始化 .tmp/ 目录：', e.message);
  process.exit(1);
}

const entries = fs.readdirSync(ROOT, { withFileTypes: true });
const violations = [];
for (const e of entries) {
  const name = e.name;
  if (GIT_INTERNAL.has(name)) continue;
  if (name === '.tmp') continue; // 唯一合法的临时文件存放子目录
  if (ENV_IGNORED.has(name)) continue; // 环境类忽略文件，非临时产物
  const reason = tempReason(name);
  if (reason) {
    // 活跃进程（如 IDE 预览服务）持有句柄的日志：已归档归档到 .tmp/logs/ 且原文件清空时，
    // 给出提示但不阻断——否则句柄释放前门禁将永久红灯。仍建议服务停止后删除空壳。
    if (/^preview\.(log|err|out|txt)$/.test(name)) {
      try {
        const stat = fs.statSync(path.join(ROOT, name));
        const archived = fs.existsSync(path.join(ROOT, '.tmp', 'logs', name));
        if (stat.size === 0 && archived) {
          console.warn(`⚠ 根目录 "${name}" 为空壳且已归档至 .tmp/logs/，服务停止后请删除原文件`);
          continue;
        }
      } catch { /* 读取失败则按违规处理 */ }
    }
    let target = '.tmp/logs/';
    if (/^_.*\.(mjs|cjs|js|mts|ts|tsx)$/.test(name)) target = '.tmp/scripts/';
    else if (/\.tsbuildinfo$/.test(name)) target = '.tmp/cache/';
    else if (/^\./.test(name)) target = '.tmp/';
    violations.push(`${reason} "${name}" 必须移入根目录 ${target}（详见 docs/TEMP-FILES.md）`);
    continue;
  }
  if (isIgnored(name)) continue;
  if (ALLOWED.has(name) || isAllowedPattern(name)) continue;
  violations.push(`${e.isDirectory() ? '目录' : '文件'} "${name}" 不应出现在仓库根目录`);
}

// scripts/ 子目录检查：正式工具目录不得存放临时脚本（_ 前缀脚本/测试类）。
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
  for (const e of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
    if (e.isDirectory()) continue; // lib/ 等正式子目录放行
    if (TEMP_LOG_RE.test(e.name)) continue; // 日志类：可能是活跃产物，放行
    if (!/^_.*\.(mjs|cjs|js|mts|ts|tsx)$/.test(e.name)) continue;
    violations.push(`文件 scripts/${e.name} 是临时脚本，应移入根目录 .tmp/scripts/（详见 docs/TEMP-FILES.md）`);
  }
}

if (violations.length) {
  console.error('✗ 根目录清洁度门禁失败：发现未归位的散落条目');
  console.error('  请将临时文件统一移入根目录 .tmp/ 子目录（已被 .gitignore 忽略）。');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
}
console.log('✓ 根目录清洁度检查通过：无非 .tmp/ 的散落临时文件');
process.exit(0);
