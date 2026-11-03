import fs from 'fs';
import path from 'path';
function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(f)) out.push(p);
  }
  return out;
}
const ids = new Set();
for (const f of walk('src/components').concat(walk('src/app'))) {
  const c = fs.readFileSync(f, 'utf8');
  for (const m of c.matchAll(/id=\{?["'`]([^"'`$]+)["'`]/g)) ids.add(m[1]);
  for (const m of c.matchAll(/id="([^"]+)"/g)) ids.add(m[1]);
}
console.log('=== src id (' + ids.size + ') ===');
console.log([...ids].sort().join(' '));
