// src/utils/sortDedupe.ts v3.7.32
import { parseDomainLine, ParseResult } from './domainValidator';

// 排序域名：按"块"处理，每段注释（分组标题）及其下方数据行作为一个块，
// 块内数据行单独排序，注释与块顺序保持不变；空行作为独立分隔块原样保留。
export const sortDomains = (sourceInput: string): string => {
  const lines = sourceInput.split('\n');

  type Block = { headers: string[]; body: string[] };
  const blocks: Block[] = [];
  let curHeaders: string[] = [];
  let curBody: string[] = [];

  const flush = () => {
    if (curHeaders.length > 0 || curBody.length > 0) {
      blocks.push({ headers: [...curHeaders], body: [...curBody] });
    }
    curHeaders = [];
    curBody = [];
  };

  for (const line of lines) {
    const parsed = parseDomainLine(line);
    if (parsed.type === 'comment') {
      // 注释行作为新块的分组标题；若当前已有数据，先结束上一块
      if (curBody.length > 0) flush();
      curHeaders.push(line);
    } else if (parsed.type === 'empty') {
      // 空行：结束当前块，自身作为独立分隔块
      flush();
      blocks.push({ headers: [], body: [line] });
    } else {
      // 数据行（域名 / 白名单 / 自定义 DNS 等）
      curBody.push(line);
    }
  }
  flush();

  // 块内数据按其归一化域名排序，注释头与块顺序保持原样
  const sortedBlocks = blocks.map((blk) => {
    if (blk.body.length === 0) {
      return blk.headers.concat(blk.body);
    }
    const sortedBody = blk.body
      .map((line) => ({ line, key: (parseDomainLine(line).domain || '').toLowerCase() }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item) => item.line);
    return blk.headers.concat(sortedBody);
  });

  return sortedBlocks.flat().join('\n');
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




