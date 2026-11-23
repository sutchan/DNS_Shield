#!/usr/bin/env node
// scripts/check-security-headers.mjs — 安全响应头多部署目标一致性门禁
// 生产环境有两套独立的头注入路径：
//   1. next.config.js headers()   —— Vercel / next start 生效
//   2. edgeone.json headers       —— EdgeOne Pages 静态托管生效（本项目主部署路径）
// 两处若漂移，会出现「Vercel 有 CSP、EdgeOne 无 CSP」的安全缺口（历史上 vercel.json
// 与 next.config.js 就曾不一致）。本脚本核对两处的头集合与关键值一致。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const nextConfig = fs.readFileSync(path.join(ROOT, 'next.config.js'), 'utf8');
const edgeonePath = path.join(ROOT, 'edgeone.json');

const REQUIRED_HEADERS = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Strict-Transport-Security',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
];

const errors = [];
if (!fs.existsSync(edgeonePath)) {
  errors.push('edgeone.json 不存在：EdgeOne 静态部署不会注入安全头');
} else {
  const config = JSON.parse(fs.readFileSync(edgeonePath, 'utf8'));
  const entries = config.headers?.flatMap((r) => r.headers ?? []) ?? [];
  const keys = new Set(entries.map((h) => h.key));
  for (const key of REQUIRED_HEADERS) {
    if (!keys.has(key)) errors.push(`edgeone.json 缺少安全头 ${key}`);
  }
  // next.config.js 中声明的头必须齐全（按 key 字符串出现判定）
  for (const key of REQUIRED_HEADERS) {
    if (!nextConfig.includes(`'${key}'`) && !nextConfig.includes(`"${key}"`)) {
      errors.push(`next.config.js 缺少安全头 ${key}`);
    }
  }
  // CSP 关键指令必须在两处都出现
  const edgeoneCsp = entries.find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
  for (const directive of ["frame-ancestors 'none'", "object-src 'none'", "upgrade-insecure-requests"]) {
    if (!edgeoneCsp.includes(directive)) errors.push(`edgeone.json CSP 缺少 ${directive}`);
    if (!nextConfig.includes(directive)) errors.push(`next.config.js CSP 缺少 ${directive}`);
  }
}

if (errors.length) {
  console.error('✗ 安全头一致性校验失败：');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('✓ 安全头一致性校验通过：next.config.js 与 edgeone.json 均含 8 项安全头');
