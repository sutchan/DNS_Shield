// 外科式修复：只删除悬空符号链接与内容缺失的包目录（不触碰 node_modules 整体）
const fs = require('fs');
const path = require('path');
const base = 'node_modules/.pnpm';
let removedLinks = 0;
let removedDirs = 0;

// 1) 删除各包 scope 下的悬空 peer 链接（react / react-dom 等）
for (const d of fs.readdirSync(base)) {
  const nm = path.join(base, d, 'node_modules');
  if (!fs.existsSync(nm)) continue;
  for (const entry of fs.readdirSync(nm)) {
    const full = path.join(nm, entry);
    if (entry.startsWith('@')) {
      for (const p of fs.readdirSync(full)) {
        const pkgDir = path.join(full, p);
        if (fs.lstatSync(pkgDir).isSymbolicLink() && !fs.existsSync(path.join(pkgDir, 'package.json'))) {
          fs.unlinkSync(pkgDir);
          removedLinks++;
        }
      }
    } else if (fs.lstatSync(full).isSymbolicLink() && !fs.existsSync(path.join(full, 'package.json'))) {
      fs.unlinkSync(full);
      removedLinks++;
    }
  }
}

// 2) 删除内容缺失的包内容目录（保留 .pnpm 目录本身，让 pnpm 重新链接）
for (const d of fs.readdirSync(base)) {
  const nm = path.join(base, d, 'node_modules');
  if (!fs.existsSync(nm)) continue;
  for (const entry of fs.readdirSync(nm)) {
    const full = path.join(nm, entry);
    const list = entry.startsWith('@') ? fs.readdirSync(full).map((p) => entry + '/' + p) : [entry];
    for (const name of list) {
      const pkgDir = path.join(nm, name);
      if (fs.lstatSync(pkgDir).isSymbolicLink()) continue;
      if (!fs.existsSync(path.join(pkgDir, 'package.json'))) {
        fs.rmSync(pkgDir, { recursive: true, force: true });
        removedDirs++;
      }
    }
  }
}

// 3) 删除根层悬空链接
let removedRoot = 0;
for (const entry of fs.readdirSync('node_modules')) {
  if (entry.startsWith('.')) continue;
  const full = path.join('node_modules', entry);
  if (entry.startsWith('@')) {
    for (const p of fs.readdirSync(full)) {
      const pkgDir = path.join(full, p);
      if (fs.lstatSync(pkgDir).isSymbolicLink() && !fs.existsSync(path.join(pkgDir, 'package.json'))) {
        fs.unlinkSync(pkgDir);
        removedRoot++;
      }
    }
  } else if (fs.lstatSync(full).isSymbolicLink() && !fs.existsSync(path.join(full, 'package.json'))) {
    fs.unlinkSync(full);
    removedRoot++;
  }
}
console.log('removed peer links=' + removedLinks + ' broken content dirs=' + removedDirs + ' root dangling links=' + removedRoot);
