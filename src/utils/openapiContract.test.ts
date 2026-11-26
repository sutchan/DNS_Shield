// src/utils/openapiContract.test.ts v3.22.4
// T-DOC-04：验证 OpenAPI 语义门禁对注入错误的阻断能力。
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateOpenApiText } from '../../scripts/lib/validateOpenApi.mjs';

const root = join(import.meta.dirname, '..', '..');
const yaml = readFileSync(join(root, 'docs', 'openapi.yaml'), 'utf8');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;

describe('OpenAPI 语义门禁', () => {
  it('当前规范无错误且包含 7 条真实路径', () => {
    const result = validateOpenApiText(yaml, version);
    expect(result.errors).toEqual([]);
    expect(result.pathCount).toBe(7);
    expect(result.operationCount).toBe(7);
  });

  it('注入错误版本时阻断', () => {
    const broken = yaml.replace(/^  version: \S+$/m, '  version: 0.0.0');
    expect(validateOpenApiText(broken, version).errors.join(' ')).toContain('info.version');
  });

  it('注入不存在的 path 参数时阻断', () => {
    const broken = yaml.replace('name: ruleFile', 'name: bogusFile');
    expect(validateOpenApiText(broken, version).errors.join(' ')).toContain('bogusFile');
  });

  it('注入未解析的 response $ref 时阻断', () => {
    const broken = yaml.replace('#/components/responses/NotFound', '#/components/responses/Missing');
    expect(validateOpenApiText(broken, version).errors.join(' ')).toContain('Missing');
  });
});
