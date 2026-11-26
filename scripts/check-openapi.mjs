#!/usr/bin/env node
// scripts/check-openapi.mjs v3.22.4
// OpenAPI 3.1 语义校验 CLI；校验逻辑在 scripts/lib/validateOpenApi.mjs，
// 由 src/utils/openapiContract.test.ts 注入错误验证门禁有效性。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateOpenApiText } from './lib/validateOpenApi.mjs';

const root = join(import.meta.dirname, '..');
const text = readFileSync(join(root, 'docs', 'openapi.yaml'), 'utf8');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const { errors, pathCount, operationCount } = validateOpenApiText(text, version);

if (errors.length) {
  console.error('OpenAPI 校验失败：');
  for (const error of errors) console.error('  - ' + error);
  process.exit(1);
}
console.log(`OpenAPI 3.1 校验通过：${pathCount} 条路径，${operationCount} 个操作，版本 ${version}`);
