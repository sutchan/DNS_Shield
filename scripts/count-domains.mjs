#!/usr/bin/env node
/**
 * 域名计数脚本（CI 友好）
 *
 * 解析 public/domains.txt，统计黑名单域名与白名单域名数量，
 * 避免 SPEC.md / public 样例头部手动维护计数导致漂移。
 *
 * 用法：
 *   node scripts/count-domains.mjs            # 仅打印统计
 *   node scripts/count-domains.mjs --write    # 同步写入 public 样例头部计数
 *
 * 退出码：
 *   0 - 成功
 *   1 - 文件不存在或解析失败
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const domainsPath = join(root, 'public', 'domains.txt');

if (!existsSync(domainsPath)) {
  console.error(`[count-domains] 未找到 ${domainsPath}`);
  process.exit(1);
}

const raw = readFileSync(domainsPath, 'utf-8');
let blocklist = 0;
let whitelist = 0;

for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  if (trimmed.startsWith('+')) {
    whitelist += 1;
  } else {
    blocklist += 1;
  }
}

console.log(`黑名单域名: ${blocklist}`);
console.log(`白名单域名: ${whitelist}`);
console.log(`合计: ${blocklist + whitelist}`);

if (process.argv.includes('--write')) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const targets = [
    { file: 'public/hosts.txt', vprefix: '# 版本::', dprefix: '# 域名::', wprefix: '# 白名单::' },
    { file: 'public/dnsmasq.conf', vprefix: '# 版本::', dprefix: '# 域名::', wprefix: '# 白名单::' },
    { file: 'public/adguard.txt', vprefix: '! 版本::', dprefix: '! 域名::', wprefix: '! 白名单::' },
  ];
  for (const t of targets) {
    const p = join(root, t.file);
    if (!existsSync(p)) continue;
    let content = readFileSync(p, 'utf-8');
    content = content
      .replace(new RegExp(`^${escapeReg(t.dprefix)}.*$`, 'm'), `${t.dprefix} ${blocklist} 个唯一域名`)
      .replace(new RegExp(`^${escapeReg(t.wprefix)}.*$`, 'm'), `${t.wprefix} ${whitelist} 个域名`)
      .replace(new RegExp(`^${escapeReg(t.vprefix)}.*$`, 'm'), `${t.vprefix} 3.7.34`);
    if (content.includes('# 更新::') || content.includes('! 更新::')) {
      const uprefix = t.vprefix.startsWith('!') ? '! 更新::' : '# 更新::';
      content = content.replace(new RegExp(`^${escapeReg(uprefix)}.*$`, 'm'), `${uprefix} ${stamp}`);
    }
    writeFileSync(p, content, 'utf-8');
    console.log(`已更新 ${t.file}`);
  }
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
