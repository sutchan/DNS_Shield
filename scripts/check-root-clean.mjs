#!/usr/bin/env node
// scripts/check-root-clean.mjs — 根目录清洁度门禁（白名单制）
//
// 规范：所有临时文件（一次性脚本、探针、运行日志、中间产物）统一存放于仓库根的
// .tmp/ 子目录（已被 .gitignore 忽略），禁止在仓库根或其他顶层位置散落。
// 本脚本用于 CI 首步拦截：任何「未被 gitignore 且不在白名单」的根级条目均视为
// 违规散落，门禁失败并给出修正指引。
import fs from 'node:fs';
import cp from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');

// 根目录合法条目白名单：被 .gitignore 忽略的条目无需列入（脚本已跳过），
// 此集合仅覆盖「未被忽略」的根级条目；新增合法根文件时在此补登记。
const ALLOWED = new Set([
  // 文件
  '.env.example', '.eslintrc.json', '.gitattributes', '.gitignore', '.npmrc',
  'CHANGELOG.md', 'DEPLOYMENT.md', 'DNS_Shield.code-workspace', 'edgeone.json',
  'LICENSE', 'next-env.d.ts', 'next.config.js', 'package.json', 'pnpm-lock.yaml',
  'pnpm-workspace.yaml', 'postcss.config.js', 'README.en.md', 'README.md',
  'tailwind.config.js', 'tsconfig.json', 'vercel.json', 'vitest.config.ts',
  // 目录
  '.github', 'docs', 'openwrt-package', 'prototype', 'public', 'scripts', 'src',
]);

// 额外允许的模式（如 README.zh.md、tsconfig.app.json）
function isAllowedPattern(name) {
  return /^README(\.[a-z]{2})?\.md$/.test(name) || /^tsconfig\..*\.json$/.test(name);
}

// git 内部目录永远跳过
const GIT_INTERNAL = new Set(['.git']);

function isIgnored(name) {
  try {
    // 统一为 POSIX 风格相对路径：Windows 下 path.join 产生反斜杠，
    // 会让 git check-ignore 的规则匹配不可靠（已忽略文件被误判为未忽略而误报）
    const rel = name.split(path.sep).join('/');
    cp.execSync(`git check-ignore -q ${JSON.stringify(rel)}`, {
      cwd: ROOT,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

// 临时文件特征判定（优先于 gitignore 跳过逻辑）：
// ① 脚本/测试类（_ 前缀 + .mjs/.cjs/.js/.ts/.tsx）——一次性脚本、探针、临时测试，
//    只允许存在于根 .tmp/ 子目录；出现在根目录或 scripts/ 即为违规散落。
//    此类文件即使被 .gitignore 兜底忽略（不会入库），也必须归位——否则「忽略」会
//    掩盖散落事实，门禁形同虚设。
// ② 日志类（_ 前缀 + .txt/.log/.out/.err）——运行日志，可能是仍在写入的活跃产物
//    （如外部会话的 vitest 输出重定向），不阻断门禁。
const TEMP_SCRIPT_RE = /^_.*\.(mjs|cjs|js|mts|ts|tsx)$/;
const TEMP_LOG_RE = /^_.*\.(txt|log|out|err)$/;

const entries = fs.readdirSync(ROOT, { withFileTypes: true });
const violations = [];
for (const e of entries) {
  const name = e.name;
  if (GIT_INTERNAL.has(name)) continue;
  if (name === '.tmp') continue; // 唯一合法的临时文件存放子目录
  // 临时脚本优先判定：不受 gitignore 兜底影响，必须已归位到 .tmp/
  if (TEMP_SCRIPT_RE.test(name)) {
    violations.push(`文件 "${name}" 是临时脚本，应移入根目录 .tmp/ 子目录`);
    continue;
  }
  if (isIgnored(name)) continue; // .tmp/、*out.txt、coverage/ 等已忽略
  if (ALLOWED.has(name) || isAllowedPattern(name)) continue;
  violations.push(`${e.isDirectory() ? '目录' : '文件'} "${name}" 不应出现在仓库根目录`);
}

// scripts/ 子目录检查：正式工具目录不得存放临时脚本（_ 前缀脚本/测试类）。
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
  for (const e of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
    if (e.isDirectory()) continue; // lib/ 等正式子目录放行
    if (TEMP_LOG_RE.test(e.name)) continue; // 日志类：可能是仍在写入的活跃产物，放行
    if (!TEMP_SCRIPT_RE.test(e.name)) continue;
    violations.push(`文件 "scripts/${e.name}" 是临时脚本，不应占用正式工具目录（请移入根目录 .tmp/ 子目录）`);
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
