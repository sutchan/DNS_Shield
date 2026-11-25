#!/usr/bin/env node
// scripts/manage-tmp.mjs — 临时目录管理工具（init / clean）
// 规范：仓库唯一合法临时位置为根目录 .tmp/，子目录由本脚本幂等创建。
// 用法：node scripts/manage-tmp.mjs [--init|--clean]（默认 --init）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const TMP = path.join(ROOT, '.tmp');
const SUBDIRS = ['scripts', 'logs', 'cache', 'downloads', 'test-output'];

const mode = process.argv[2] || '--init';

function init() {
  fs.mkdirSync(TMP, { recursive: true });
  for (const sub of SUBDIRS) fs.mkdirSync(path.join(TMP, sub), { recursive: true });
  console.log(`✓ 临时目录已就绪：${path.relative(ROOT, TMP)}/（${SUBDIRS.join('、')}）`);
}

// 递归清空：逐文件 unlink、空目录 rmdir。
// 不用 fs.rmSync —— IDE safe-delete shim 会劫持它为 trash 二进制并可能超时，
// 详见 docs/06-faq-troubleshooting.md 的 coverage 清理条目。
function purge(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { purge(p); fs.rmdirSync(p); }
    else fs.unlinkSync(p);
  }
}

function clean() {
  purge(TMP);
  init();
  console.log('✓ .tmp/ 已清空并重建空子目录');
}

if (mode === '--clean') clean();
else if (mode === '--init' || mode === '--help') {
  init();
  if (mode === '--help') console.log('用法：node scripts/manage-tmp.mjs [--init|--clean]');
} else {
  console.error(`✗ 未知参数：${mode}（可用：--init / --clean / --help）`);
  process.exit(1);
}
