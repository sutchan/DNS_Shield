// vitest.config.ts v3.7.15
// 纯函数单元测试配置：仅覆盖 src/utils 下的无副作用工具函数。
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 纯函数测试无需 DOM 环境
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
});
