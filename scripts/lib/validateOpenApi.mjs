// scripts/lib/validateOpenApi.mjs v3.22.4
// OpenAPI 3.1 纯文本语义校验（T-DOC-04）：无第三方依赖，供 CLI 与单测共用。
export function validateOpenApiText(text, version) {
  const normalized = text.replace(/\r\n/g, '\n');
  const errors = [];
  if (!/^openapi:\s*3\.1\.\d+\s*$/m.test(normalized)) errors.push('openapi 字段必须为 3.1.x');

  const infoBlock = normalized.match(/^info:\n([\s\S]*?)(?=^\S)/m)?.[1] ?? '';
  const infoVersion = infoBlock.match(/^  version:\s*(\S+)/m)?.[1];
  if (infoVersion !== version) errors.push(`info.version=${infoVersion} 与 package.json(${version}) 不一致`);

  const pathMatches = [...normalized.matchAll(/^  (\/[^:\s]*):\s*$/gm)];
  if (pathMatches.length === 0) errors.push('paths 为空');
  const ids = [];
  for (let i = 0; i < pathMatches.length; i++) {
    const start = pathMatches[i].index;
    const end = i + 1 < pathMatches.length ? pathMatches[i + 1].index : normalized.length;
    const block = normalized.slice(start, end);
    const template = pathMatches[i][1];
    if (!/^\s+responses:\s*$/m.test(block)) errors.push(`${template} 缺少 responses`);
    for (const id of block.matchAll(/^\s+operationId:\s*(\S+)/gm)) ids.push(id[1]);

    // path 参数名必须在路径模板中出现
    for (const m of block.matchAll(/^\s+in:\s*path\s*$/gm)) {
      const before = block.slice(0, m.index);
      const name = [...before.matchAll(/^\s+- name:\s*(\S+)/gm)].pop()?.[1];
      if (!name || !template.includes(`{${name}}`)) {
        errors.push(`${template} 的 path 参数 ${name ?? '(缺失 name)'} 不存在于路径模板`);
      }
    }
  }
  if (new Set(ids).size !== ids.length) errors.push('operationId 重复');

  const componentNames = new Set(
    [...normalized.matchAll(/^    ([A-Za-z][\w-]*):\s*$/gm)].map((m) => m[1])
  );
  for (const ref of normalized.matchAll(/\$ref:\s*'#\/components\/(schemas|responses)\/([^']+)'/g)) {
    if (!componentNames.has(ref[2])) errors.push(`未解析的 $ref: ${ref[1]}/${ref[2]}`);
  }

  // 示例域名必须来自 servers 声明（docs/04-api.md 与 openapi.yaml 共用）
  for (const m of normalized.matchAll(/\bexample:\s*(\S+)/g)) {
    if (/^https?:\/\//.test(m[1]) && !/^https?:\/\/(dns\.ewuse\.com|localhost:3000)(\/|$)/.test(m[1])) {
      errors.push(`示例域名未在 servers 声明：${m[1]}`);
    }
  }

  return { errors, pathCount: pathMatches.length, operationCount: ids.length };
}
