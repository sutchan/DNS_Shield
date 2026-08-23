import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out = out.concat(walk(p));
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

const files = walk('src').map((f) => [readFileSync(f, 'utf8').split('\n').length, f]);
files.sort((a, b) => b[0] - a[0]);
for (const [n, f] of files) {
  console.log(`${n}\t${f}`);
}
