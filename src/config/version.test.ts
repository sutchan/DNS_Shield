// src/config/version.test.ts v3.22.0
// L-08 / T-VER-01：版本号权威源为 package.json，运行时常量与构建配置不得漂移。
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_VERSION } from './version';

const root = join(process.cwd());
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string };

describe('版本号单一来源', () => {
  it('APP_VERSION 与 package.json.version 一致（T-AUD-L08）', () => {
    expect(APP_VERSION).toBe(pkg.version);
  });

  it('next.config.js 从 package.json 读取版本，不再硬编码字面量（T-VER-01）', () => {
    const config = readFileSync(join(root, 'next.config.js'), 'utf8');
    expect(config).toContain("require('./package.json')");
    expect(config).not.toMatch(/version:\s*'\d+\.\d+\.\d+'/);
  });
});
