// vitest.config.ts v3.10.1
// Pure-function unit test config: covers side-effect-free utils under src/utils.
// Coverage must exclude test files themselves: test code (always 0% hit) would
// otherwise enter the coverage denominator and dilute the global number (old config
// measured 47.85%, while the real covered source is about 95%+).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'src/utils/index.ts'],
      reporter: ['text', 'html'],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
