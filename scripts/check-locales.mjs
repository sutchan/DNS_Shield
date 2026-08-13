#!/usr/bin/env node
/**
 * locale 键一致性校验脚本（CI 友好）
 *
 * 以 src/locales/zh-cn.json 为基准，递归比较所有其他 locale 文件，
 * 检查是否存在【缺键】或【多余键】，确保运行时 deepMerge 兜底前就能在 CI 阶段发现漏翻。
 *
 * 用法：
 *   node scripts/check-locales.mjs
 * 退出码：
 *   0 - 全部一致
 *   1 - 存在不一致（打印明细）
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, '..', 'src', 'locales');

/** 递归展开嵌套对象为点分路径键集合，如 {a:{b:1}} -> {"a.b":1} */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      out[key] = typeof v;
    }
  }
  return out;
}

const files = readdirSync(localesDir).filter((f) => f.endsWith('.json'));
if (files.length === 0) {
  console.error('未在 src/locales 找到任何 JSON 文件');
  process.exit(1);
}

const baseName = 'zh-cn.json';
if (!files.includes(baseName)) {
  console.error(`缺少基准文件 ${baseName}，无法执行键一致性校验`);
  process.exit(1);
}

const baseKeys = Object.keys(flatten(JSON.parse(readFileSync(join(localesDir, baseName), 'utf8'))));
const baseSet = new Set(baseKeys);

let hasError = false;
const errors = [];

for (const file of files) {
  if (file === baseName) continue;
  const keys = flatten(JSON.parse(readFileSync(join(localesDir, file), 'utf8')));
  const keySet = new Set(Object.keys(keys));

  const missing = [...baseSet].filter((k) => !keySet.has(k));
  const extra = [...keySet].filter((k) => !baseSet.has(k));

  if (missing.length || extra.length) {
    hasError = true;
    errors.push({ file, missing, extra });
  }
}

if (hasError) {
  console.error('❌ locale 键一致性校验失败：\n');
  for (const { file, missing, extra } of errors) {
    console.error(`  ${file}:`);
    if (missing.length) {
      console.error(`    缺键 (${missing.length}): ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? ' …' : ''}`);
    }
    if (extra.length) {
      console.error(`    多余键 (${extra.length}): ${extra.slice(0, 20).join(', ')}${extra.length > 20 ? ' …' : ''}`);
    }
  }
  console.error('\n请补全缺失的翻译键或移除多余键，保持与 zh-cn.json 一致。');
  process.exit(1);
}

console.log(`✅ locale 键一致性校验通过：共 ${files.length} 个语言文件，基准 ${baseName}（${baseKeys.length} 个键）全部一致。`);
process.exit(0);
