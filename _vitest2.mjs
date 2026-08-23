import { spawnSync } from 'child_process';
const r = spawnSync('node', ['node_modules/vitest/vitest.mjs', 'run'], { stdio: 'inherit' });
console.log(r.status === 0 ? 'VITEST_OK' : 'VITEST_FAIL');
