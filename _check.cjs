const fs = require('fs');
const path = require('path');
const base = 'node_modules/.pnpm';
const broken = [];
for (const d of fs.readdirSync(base)) {
  const nm = path.join(base, d, 'node_modules');
  if (!fs.existsSync(nm)) continue;
  for (const scopeOrPkg of fs.readdirSync(nm)) {
    const full = path.join(nm, scopeOrPkg);
    if (scopeOrPkg.startsWith('@')) {
      for (const p of fs.readdirSync(full)) {
        if (!fs.existsSync(path.join(full, p, 'package.json'))) broken.push(scopeOrPkg + '/' + p);
      }
    } else if (!fs.existsSync(path.join(full, 'package.json'))) {
      broken.push(scopeOrPkg);
    }
  }
}
console.log('broken count = ' + broken.length);
console.log(broken.slice(0, 40).join('\n'));
