// src/config/version.ts v3.12.0
// 应用版本号单一来源：useSettings / Footer / layout 等展示位置统一引用此处，
// 避免多处硬编码版本字符串导致不同步。全局版本仍以 package.json 为准。
// 文档展示位由 scripts/sync-facts.mjs 从 package.json 派生，改版本只需改 package.json。
export const APP_VERSION = '3.12.0';
