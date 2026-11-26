// vitest.bench.config.ts v3.22.4
// 独立基准配置：只收集 *.bench.ts，避免 50MB 用例进入默认测试套件计数与覆盖率。
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.bench.ts'],
  },
});
