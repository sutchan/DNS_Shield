// vitest.config.ts v3.11.0
// Pure-function unit test config: covers side-effect-free utils under src/utils.
// Since Vitest 3.2.7 the v8 provider no longer double-counts sources on Windows
// (the old drive-letter casing bug `e:\...` vs `E:\...` is fixed), so the reported
// figures are the real coverage numbers again and thresholds are enforced against
// those. Measured on v3.11.0: statements 84.46 / branches 86.81 /
// functions 91.07 / lines 84.46.
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
      thresholds: {
        // 回归真实值门禁（Vitest 3.x 修复 Windows 重复计数后，报告值即为真实覆盖率）
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },
    },
  },
});
