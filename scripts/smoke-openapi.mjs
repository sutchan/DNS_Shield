#!/usr/bin/env node
// scripts/smoke-openapi.mjs v3.22.4
// T-DOC-04：对 openapi.yaml 声明的 7 条真实端点做本地契约冒烟。
// 依赖已构建的 .next；由 CI build job 在 npm run build 之后调用。
import { spawn } from 'node:child_process';

const PORT = 3100;
const base = `http://127.0.0.1:${PORT}`;
const endpoints = [
  ['/', 'text/html'],
  ['/about', 'text/html'],
  ['/robots.txt', 'text/plain'],
  ['/sitemap.xml', 'application/xml'],
  ['/llms.txt', 'text/plain'],
  ['/category-index.txt', 'text/plain'],
  ['/domains.txt', 'text/plain'],
];

const child = spawn(process.execPath, [
  'node_modules/next/dist/bin/next', 'start', '-p', String(PORT),
], { cwd: process.cwd(), stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const stop = () => { try { child.kill('SIGTERM'); } catch {} };
process.on('exit', stop);

try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${base}/robots.txt`);
      if (r.ok) { ready = true; break; }
    } catch {}
    await sleep(500);
  }
  if (!ready) throw new Error('next start 在 30s 内未就绪');

  const failures = [];
  for (const [path, contentType] of endpoints) {
    const r = await fetch(base + path);
    const actual = r.headers.get('content-type') ?? '';
    if (r.status !== 200) failures.push(`${path}: HTTP ${r.status}`);
    else if (!actual.includes(contentType)) failures.push(`${path}: Content-Type=${actual}`);
  }
  if (failures.length) {
    console.error('API 契约冒烟失败：\n  - ' + failures.join('\n  - '));
    process.exitCode = 1;
  } else {
    console.log(`API 契约冒烟通过：${endpoints.length} 条端点均为 200 且 Content-Type 匹配`);
  }
} catch (error) {
  console.error('API 契约冒烟异常：' + error.message);
  process.exitCode = 1;
} finally {
  stop();
}
