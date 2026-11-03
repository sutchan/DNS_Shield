import fs from 'fs';
for (const f of ['.verify_test.txt', '.verify_lint.txt']) {
  if (!fs.existsSync(f)) { console.log(f + ': MISSING'); continue; }
  let c = fs.readFileSync(f, 'utf8');
  // strip ANSI
  c = c.replace(/\x1b\[[0-9;]*m/g, '');
  console.log('\n===== ' + f + ' (' + c.split('\n').length + ' lines) =====');
  console.log(c.split('\n').filter(l =>
    /Test Files|Tests |FAIL|error|Error|warning|Warning|✔|✓|❯|passed|failed|EXIT/.test(l)
  ).slice(-40).join('\n'));
}
