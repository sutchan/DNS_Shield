import fs from 'fs';
import path from 'path';
const skip = new Set(['node_modules', '.git', '.next', 'coverage', '.pnpm-store']);
const exts = /\.(ts|tsx|js|mjs|json|md|html|css|yaml|yml|txt|conf)$/;
function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    if (skip.has(f)) continue;
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (exts.test(f) && st.size < 400000) out.push(p);
  }
  return out;
}
for (const f of walk('.')) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  const hits = [];
  lines.forEach((l, i) => { if (/3\.13\.|v3\.|3\.12\.|3\.11\./.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 120)); });
  if (hits.length) {
    console.log('\n=== ' + f + ' ===');
    hits.forEach(h => console.log(h));
  }
}
