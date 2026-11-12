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
    cp.execSync(`git check-ignore -q ${JSON.stringify(name)}`, {
      cwd: ROOT,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

const entries = fs.readdirSync(ROOT, { withFileTypes: true });
const violations = [];
for (const e of entries) {
  const name = e.name;
  if (GIT_INTERNAL.has(name)) continue;
  if (isIgnored(name)) continue; // .tmp/、*out.txt 等已忽略
  if (ALLOWED.has(name) || isAllowedPattern(name)) continue;
  violations.push(`${e.isDirectory() ? '目录' : '文件'} "${name}" 不应出现在仓库根目录`);
}

// 额外检查：scripts/ 子目录禁止临时脚本散落（_ 前缀文件）。
// 临时脚本（一次性验证/转换脚本）统一存放于根 .tmp/ 子目录，不得占用正式工具目录。
// 已被 .gitignore 忽略的运行日志（如 _out.txt / _err.txt）不会进仓库，不在此拦截；
// 仅拦截「未忽略、会被提交进仓库」的 _ 前缀文件——那才是真正的污染风险。
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
  for (const e of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
    if (e.isDirectory()) continue; // lib/ 等正式子目录放行
    if (!e.name.startsWith('_')) continue;
    if (isIgnored(path.join('scripts', e.name))) continue;
    violations.push(`文件 "scripts/${e.name}" 不应出现在 scripts/（临时脚本请统一移入根目录 .tmp/ 子目录）`);
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
