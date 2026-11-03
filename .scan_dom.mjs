import fs from 'fs';
const raw = fs.readFileSync('public/domains.txt', 'utf8');
const lines = raw.split('\n');
const c = { empty: 0, hashComment: 0, bang: 0, at: 0, plus: 0, plain: 0 };
for (const line of lines) {
  const t = line.trim();
  if (!t) c.empty++;
  else if (t.startsWith('#')) c.hashComment++;
  else if (t.startsWith('!')) c.bang++;
  else if (t.startsWith('@')) c.at++;
  else if (t.startsWith('+')) c.plus++;
  else c.plain++;
}
console.log(c);
console.log('脚本口径 blacklist(plain+bang+at) =', c.plain + c.bang + c.at, ' whitelist =', c.plus);
console.log('纯有效域名(plain) =', c.plain, ' + whitelist =', c.plain + c.plus);
