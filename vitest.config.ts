// vitest.config.ts v3.12.0
// 单元测试配置：覆盖纯逻辑层（src/utils）与编排层（src/hooks）。
// Since Vitest 3.2.7 the v8 provider no longer double-counts sources on Windows
// (the old drive-letter casing bug `e:\...` vs `E:\...` is fixed), so the reported
// figures are the real coverage numbers again and thresholds are enforced against
// those.
// 环境策略：默认 node（纯逻辑用例）；hooks 用例在文件头用
// `// @vitest-environment jsdom` 逐文件声明，避免为纯逻辑测试引入 DOM 开销。
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      // utils = 纯逻辑层；hooks = 状态编排层（v3.12.0 起纳入门禁）
      include: ['src/utils/**/*.ts', 'src/hooks/**/*.ts'],
      // test-utils 为测试辅助代码（renderHook 等），不属于被测源码
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'src/test-utils/**'],
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
