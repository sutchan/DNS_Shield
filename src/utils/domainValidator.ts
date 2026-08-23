// src/utils/domainValidator.ts v3.8.0
// 公开 API 兼容层：原模块已按职责拆分为 parseLine.ts（单行解析）与 domainPrimitives.ts（校验原语），
// 本文件仅重新导出，保持对 parser.ts / sortDedupe.ts / domainValidator.test.ts 等调用方的导入路径不变。

export { parseDomainLine } from './parseLine';
// 校验原语与类型透传，保持历史调用方 `import { isValidDomain } from './domainValidator'` 可用
export { isValidDomain, isValidIp, normalizeDomain } from './domainPrimitives';
export type { ParseResult, ParseStats } from '../types/formats';
