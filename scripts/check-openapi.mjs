// scripts/check-openapi.mjs v3.22.0
// OpenAPI 3.1 轻量规范校验（T-VERIFY-01）：无第三方依赖，CI 可离线运行。
// 校验：版本声明 / info.version 与 package.json 一致 / path 有 responses /
// operationId 唯一 / 本地 $ref 可解析。完整语义校验仍可由 redocly 在 CI 增强。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const file = join(root, 'docs', 'openapi.yaml');
const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const errors = [];

if (!/^openapi:\s*3\.1\.\d+\s*$/m.test(text)) errors.push('openapi 字段必须为 3.1.x');
const infoBlock = text.match(/^info:\n([\s\S]*?)(?=^\S)/m)?.[1] ?? '';
const infoVersion = infoBlock.match(/^  version:\s*(\S+)/m)?.[1];
if (infoVersion !== version) errors.push(`info.version=${infoVersion} 与 package.json(${version}) 不一致`);

const pathMatches = [...text.matchAll(/^  (\/[^:\s]*):\s*$/gm)];
if (pathMatches.length === 0) errors.push('paths 为空');
const ids = [];
for (let i = 0; i < pathMatches.length; i++) {
  const start = pathMatches[i].index;
  const end = i + 1 < pathMatches.length ? pathMatches[i + 1].index : text.length;
  const block = text.slice(start, end);
  if (!/^\s+responses:\s*$/m.test(block)) errors.push(`${pathMatches[i][1]} 缺少 responses`);
  for (const id of block.matchAll(/^\s+operationId:\s*(\S+)/gm)) ids.push(id[1]);
}
if (new Set(ids).size !== ids.length) errors.push('operationId 重复');

const schemaNames = new Set(
  [...text.matchAll(/^    ([A-Za-z][\w-]*):\s*$/gm)].map((match) => match[1])
);
for (const ref of text.matchAll(/\$ref:\s*'#\/components\/schemas\/([^']+)'/g)) {
  if (!schemaNames.has(ref[1])) errors.push(`未解析的 $ref: ${ref[1]}`);
}

if (errors.length) {
  console.error('OpenAPI 校验失败：');
  for (const error of errors) console.error('  - ' + error);
  process.exit(1);
}
console.log(`OpenAPI 3.1 校验通过：${pathMatches.length} 条路径，${ids.length} 个操作，版本 ${version}`);
