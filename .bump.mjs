import fs from 'fs';
const map = [
  ['package.json', '"version": "3.7.48"', '"version": "3.7.49"'],
  ['next.config.js', '3.7.48', '3.7.49'],
  ['src/app/layout.tsx', '3.7.48', '3.7.49'],
  ['README.md', '3.7.48', '3.7.49'],
  ['prototype/README.md', '3.7.48', '3.7.49'],
  ['src/config/version.ts', "APP_VERSION = '3.7.48'", "APP_VERSION = '3.7.49'"],
  ['openspec/SPEC.md', '3.7.48', '3.7.49'],
  ['openspec/CHECKLIST.md', '3.7.48', '3.7.49'],
  ['openspec/TASKS.md', '3.7.48', '3.7.49'],
];
for (const [p, from, to] of map) {
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes(from)) { console.log('NO MATCH', p, '->', from); continue; }
  c = c.split(from).join(to);
  fs.writeFileSync(p, c);
  console.log('updated', p);
}
