import fs from 'fs';
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('package.json', p.version);
const t = fs.readFileSync('src/utils/version.ts', 'utf8');
const m = t.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
console.log('src/utils/version.ts', m ? m[1] : 'NOT FOUND');
