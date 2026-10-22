#!/usr/bin/env node
/**
 * locale 键一致性校验脚本（CI 友好）
 *
 * 以 src/locales/zh-cn.json 为参考基准，递归比较所有其他 locale 文件，
 * 检查是否存在【缺键】或【多余键】，确保运行时 deepMerge 兜底前就能在 CI 阶段发现漏翻。
 *
 * ⚠️ 关键设计（T-P0-02a，2026-10-20）：
 *   zh-cn.json 自身也是「语言包」之一，若它自己缺某个键，其余 15 个包即使也缺该键，
 *   旧版脚本只做「各包相对 zh-cn 的两两一致性」比对，会静默通过（基线被悄悄缩水）。
 *   本版引入「独立基线清单」scripts/locale-baseline.json（由 zh-cn.json 生成、需显式更新），
 *   先校验 zh-cn.json 自身是否与基线一致，再校验各语言包相对 zh-cn 一致。
 *   这样「16 个包 + zh-cn 同时缺键」会被捕获（基线有、zh-cn 无 → 非零退出并指明键名）。
 *
 * 用法：
 *   node scripts/check-locales.mjs                 # 校验（CI 默认）
 *   node scripts/check-locales.mjs --update-baseline # 依当前 zh-cn.json 重新生成基线清单（新增键时运行）
 * 退出码：
 *   0 - 全部一致
 *   1 - 存在不一致（打印明细）
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, '..', 'src', 'locales');
const BASELINE_PATH = join(__dirname, 'locale-baseline.json');

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

/** 读取 zh-cn.json 并展开为排序后的点分键数组 */
function readReferenceKeys() {
  const baseName = 'zh-cn.json';
  if (!existsSync(join(localesDir, baseName))) {
    console.error(`缺少基准文件 ${baseName}，无法执行键一致性校验`);
    process.exit(1);
  }
  const keys = Object.keys(flatten(JSON.parse(readFileSync(join(localesDir, baseName), 'utf8'))));
  return { baseName, keys: new Set(keys) };
}

/** 读取（必要时自动引导生成）基线清单，返回排序后的键数组 */
function readBaselineKeys(autoBootstrap) {
  if (!existsSync(BASELINE_PATH)) {
    if (autoBootstrap) {
      const { baseName, keys } = readReferenceKeys();
      const sorted = [...keys].sort();
      writeFileSync(BASELINE_PATH, JSON.stringify({
        generatedAt: new Date().toISOString(),
        source: `src/locales/${baseName}`,
        keyCount: sorted.length,
        keys: sorted,
      }, null, 2) + '\n', 'utf8');
      console.error(`⚠️ 未找到基线清单 ${BASELINE_PATH}，已依 ${baseName} 自动生成（${sorted.length} 个键）。请将其提交到版本控制。`);
      return new Set(sorted);
    }
    console.error(`缺少基线清单 ${BASELINE_PATH}。请运行 \`node scripts/check-locales.mjs --update-baseline\` 生成。`);
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  return new Set(manifest.keys || []);
}

/** 写入/刷新基线清单 */
function updateBaseline() {
  const { baseName, keys } = readReferenceKeys();
  const sorted = [...keys].sort();
  writeFileSync(BASELINE_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: `src/locales/${baseName}`,
    keyCount: sorted.length,
    keys: sorted,
  }, null, 2) + '\n', 'utf8');
  console.log(`✅ 基线清单已刷新：${BASELINE_PATH}（${sorted.length} 个键，源 ${baseName}）`);
  process.exit(0);
}

// ---- 参数解析 ----
const UPDATE_BASELINE = process.argv.includes('--update-baseline');
if (UPDATE_BASELINE) {
  updateBaseline();
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

// ---- 独立基线校验（T-P0-02a 核心）----
// 首次运行无清单时自动引导生成，避免阻塞；其余情况用已提交的清单比对。
const baselineSet = readBaselineKeys(true);
const baselineMissing = [...baselineSet].filter((k) => !baseSet.has(k)); // 基线有、zh-cn 无 → 集体缺键
const baselineExtra = [...baseSet].filter((k) => !baselineSet.has(k));   // zh-cn 有、基线无 → 新增键未同步清单

let hasError = false;
const errors = [];

if (baselineMissing.length || baselineExtra.length) {
  hasError = true;
  errors.push({ scope: 'baseline', baselineMissing, baselineExtra });
}

// ---- 各语言包相对 zh-cn 的两两一致性（既有逻辑）----
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

  for (const e of errors) {
    if (e.scope === 'baseline') {
      console.error('  【独立基线】zh-cn.json 与基线清单 scripts/locale-baseline.json 不一致：');
      if (e.baselineMissing.length) {
        console.error(`    基线有但 zh-cn 缺失（集体缺键，CI 必须拦截）(${e.baselineMissing.length}): ${e.baselineMissing.slice(0, 30).join(', ')}${e.baselineMissing.length > 30 ? ' …' : ''}`);
      }
      if (e.baselineExtra.length) {
        console.error(`    zh-cn 有但基线缺失（疑似新增键未同步清单）(${e.baselineExtra.length}): ${e.baselineExtra.slice(0, 30).join(', ')}${e.baselineExtra.length > 30 ? ' …' : ''}`);
        console.error('    → 若为有意新增键，请运行 `node scripts/check-locales.mjs --update-baseline` 刷新基线后重新提交。');
      }
      continue;
    }
    console.error(`  ${e.file}:`);
    if (e.missing.length) {
      console.error(`    缺键 (${e.missing.length}): ${e.missing.slice(0, 20).join(', ')}${e.missing.length > 20 ? ' …' : ''}`);
    }
    if (e.extra.length) {
      console.error(`    多余键 (${e.extra.length}): ${e.extra.slice(0, 20).join(', ')}${e.extra.length > 20 ? ' …' : ''}`);
    }
  }
  console.error('\n请补全缺失的翻译键或移除多余键，保持与 zh-cn.json 及基线清单一致。');
  process.exit(1);
}

console.log(`✅ locale 键一致性校验通过：共 ${files.length} 个语言文件，基准 ${baseName}（${baseKeys.length} 个键）全部一致，且与独立基线清单（${baselineSet.size} 个键）吻合。`);
process.exit(0);
