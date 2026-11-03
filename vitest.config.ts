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
    // 补齐 jsdom 缺失的 localStorage / matchMedia 桩（见 src/test-utils/setup.ts）
    setupFiles: ['src/test-utils/setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      // utils = 纯逻辑层；hooks = 状态编排层（v3.12.0 起纳入门禁）
      include: ['src/utils/**/*.ts', 'src/hooks/**/*.ts'],
      // test-utils 为测试辅助代码（renderHook 等），不属于被测源码
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'src/test-utils/**'],
      reporter: ['text', 'html'],
      thresholds: {
        // T-P1-07 已补齐编排层测试（useRules / useDomainData / useUrlManager /
        // useHomeController / useTheme / useLoading / useFlowTokens），
        // 门槛由临时的 50/75/80/50 提升回项目原定的 80/75/85/80。
        // 2026-10-19 实测：语句 87.42 / 分支 86.0 / 函数 89.83 / 行 87.42。
        // 编排层 src/hooks 整体已达 语句 88.52 / 分支 82.0 / 函数 88.37 / 行 88.52，
        // 四项均有余量，故按原定目标值恢复门禁。
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },
    },
  },
});
