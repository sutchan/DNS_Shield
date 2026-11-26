// src/utils/sortDedupe.ts v3.22.4
// T-PERF-01：排序与去重改为逐行迭代，避免对整份 50MB 文本做 split('\n')
// 产生完整行数组（原实现峰值约为文本的 2~3 倍）。块内排序仍需数组，
// 但仅保留当前块的数据行，块结束后即可释放。
import { parseDomainLine } from './domainValidator';
import { forEachLine } from './iterateLines';

// 排序域名：按"块"处理，每段注释（分组标题）及其下方数据行作为一个块，
// 块内数据行单独排序，注释与块顺序保持不变；空行作为独立分隔块原样保留。
export const sortDomains = (sourceInput: string): string => {
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

  // 逐行迭代：不再为整份输入分配 lines 数组
  forEachLine(sourceInput, (line) => {
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
  });
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
  const seen = new Set<string>();
  const uniqueLines: string[] = [];
  let removedCount = 0;

  // 逐行迭代：去重可完全流式处理，只保留唯一行结果与 Set 键
  forEachLine(sourceInput, (line) => {
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      uniqueLines.push(line);
      return;
    }

    if (parsed.type === 'comment') {
      uniqueLines.push(line);
      return;
    }

    if (!parsed.isValid) {
      uniqueLines.push(line);
      return;
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
  });

  return {
    content: uniqueLines.join('\n'),
    removedCount
  };
};




