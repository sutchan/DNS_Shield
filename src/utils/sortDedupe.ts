// src/utils/sortDedupe.ts v3.7.15
import { parseDomainLine, ParseResult } from './domainValidator';

// 排序域名（保持表头注释在最前，白名单/自定义 DNS 等特殊行随后，注释在最后）
export const sortDomains = (sourceInput: string): string => {
  const lines = sourceInput.split('\n');

  const headerComments: string[] = [];
  const bodyLines: string[] = [];
  const specialLines: string[] = [];

  let inHeader = true;

  for (const line of lines) {
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      bodyLines.push(line);
      continue;
    }

    if (parsed.type === 'whitelist' || parsed.type === 'customDns') {
      specialLines.push(line);
      continue;
    }

    if (parsed.type === 'comment') {
      if (inHeader) {
        headerComments.push(line);
      } else {
        bodyLines.push(line);
      }
      continue;
    }

    inHeader = false;
    bodyLines.push(line);
  }

  // 一次性解析并缓存，避免后续多次重复 parseDomainLine
  const parsedBody = bodyLines.map((line) => ({ line, parsed: parseDomainLine(line) }));

  const plainDomains = parsedBody
    .filter(({ parsed }) => parsed.type === 'domain' || parsed.type === 'hosts' || parsed.type === 'dnsmasq')
    .map(({ line }) => line);

  const comments = parsedBody
    .filter(({ parsed }) => parsed.type === 'comment')
    .map(({ line }) => line);

  // Schwartzian 变换：提前解析出归一化域名用于比较，避免比较器内重复解析
  const sortedDomains = plainDomains
    .map((line) => ({ line, key: (parseDomainLine(line).domain || '').toLowerCase() }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => item.line);

  return [
    ...headerComments,
    ...sortedDomains,
    ...specialLines,
    ...comments
  ].join('\n');
};

// 去重域名（保留首次出现，返回去除行数与去重后文本）
export const dedupeDomains = (sourceInput: string): { content: string; removedCount: number } => {
  const lines = sourceInput.split('\n');

  const seen = new Set<string>();
  const uniqueLines: string[] = [];
  let removedCount = 0;

  for (const line of lines) {
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      uniqueLines.push(line);
      continue;
    }

    if (parsed.type === 'comment') {
      uniqueLines.push(line);
      continue;
    }

    if (!parsed.isValid) {
      uniqueLines.push(line);
      continue;
    }

    let key: string;
    if (parsed.type === 'whitelist' && parsed.domain) {
      key = '+' + parsed.domain;
    } else if (parsed.type === 'customDns' && parsed.domain && parsed.ip) {
      key = '@' + parsed.domain + '=' + parsed.ip;
    } else if (parsed.domain) {
      key = parsed.domain;
    } else {
      key = line;
    }

    if (!seen.has(key)) {
      seen.add(key);
      uniqueLines.push(line);
    } else {
      removedCount++;
    }
  }

  return {
    content: uniqueLines.join('\n'),
    removedCount
  };
};
