import { execSync } from 'node:child_process';
try {
  const out = execSync('node ./node_modules/vitest/vitest.mjs run --reporter=dot --no-color', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  process.stdout.write(out);
  process.exit(0);
} catch (e) {
  process.stdout.write(e.stdout || '');
  process.stderr.write(e.stderr || '');
  process.exit(1);
}
