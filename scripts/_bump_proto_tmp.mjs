import { readFileSync, writeFileSync } from 'fs';
const files = ['prototype/prototype.html', 'prototype/flows.html', 'prototype/wireframes.html'];
for (const f of files) {
  const s = readFileSync(f, 'utf8').replace(/3\.7\.62/g, '3.8.0').replace(/3\.7\.68/g, '3.8.0');
  writeFileSync(f, s, 'utf8');
  console.log('bumped', f);
}
