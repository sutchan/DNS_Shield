// src/utils/logger.ts v3.9.0
// 统一诊断日志封装：生产构建（NODE_ENV=production，由 Next.js 构建时静态替换）下抑制
// 所有诊断输出，仅开发/测试环境输出。避免生产控制台泄露内部错误栈，符合"生产无 console"规范。
// 业务级错误提示已由 toast / UI 错误态承担，不依赖 console 透出。

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const isProduction = process.env.NODE_ENV === 'production';

function emit(level: LogLevel, ...args: unknown[]): void {
  if (isProduction) return;
  const fn =
    level === 'error' ? console.error :
    level === 'warn' ? console.warn :
    level === 'info' ? console.info :
    console.log;
  fn('[DNS_Shield]', ...args);
}

export const logger = {
  error: (...args: unknown[]) => emit('error', ...args),
  warn: (...args: unknown[]) => emit('warn', ...args),
  info: (...args: unknown[]) => emit('info', ...args),
  debug: (...args: unknown[]) => emit('debug', ...args),
};
