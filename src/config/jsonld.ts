// src/config/jsonld.ts v3.22.0
// JSON-LD 内联序列化：必须转义 '<'，否则数据中的 "</script>" 会提前闭合脚本标签，
// 形成 XSS 注入面（T-AUD-L04）。转义为 \u003c 后 JSON 语义不变。
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c');
