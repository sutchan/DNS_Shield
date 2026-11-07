// src/utils/parser.ts v3.16.0
import { parseDomainLine, ParseStats } from './domainValidator';
import { CustomDnsEntry, ParsedData, RegexRule } from '../types';

// 进度回调触发间隔：每 N 行上报一次，避免高频回调拖慢解析（Worker 内 postMessage 有开销）
const PROGRESS_INTERVAL = 2000;

// 排序 / 去重职责抽离到 sortDedupe，保持公开 API 稳定
export { sortDomains, dedupeDomains } from './sortDedupe';

/** 逐行收集阶段的原始产物：未做跨行去重 / 白名单剔除（v3.16.0 供多核分片并行解析） */
export interface RawCollected {
  domains: string[];
  whitelist: string[];
  customDns: CustomDnsEntry[];
  regexRules: RegexRule[];
}

/** 逐行收集阶段的计数器：各分片的计数可直接相加 */
export interface RawCounters {
  commentCount: number;
  invalidCount: number;
  totalLines: number;
}

// 逐行收集：纯逐行解析，无跨行状态（v3.16.0 自 parseSource 拆出，
// 供多核并行时按行分片派发到多个 Worker 求值）。
// onProgress 为可选进度回调（供 Worker 分片上报解析进度），尾部补报 100%（T-P3-05）。
export const collectLines = (
  text: string,
  onProgress?: (processed: number, total: number) => void
): { raw: RawCollected; counters: RawCounters } => {
  const lines = text.split('\n');
  const total = lines.length;

  const domains: string[] = [];
  const whitelist: string[] = [];
  const customDns: CustomDnsEntry[] = [];
  const regexRules: RegexRule[] = [];
  let commentCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < lines.length; i++) {
    // 在各 continue 分支之前统一上报进度，确保跳过的行也被计入
    if (onProgress && (i + 1) % PROGRESS_INTERVAL === 0) {
      onProgress(i + 1, total);
    }
    const line = lines[i];
    const parsed = parseDomainLine(line);

    if (parsed.type === 'empty') {
      // 空行不计入注释统计，避免统计面板数字失真
      continue;
    }

    if (parsed.type === 'comment') {
      commentCount++;
      continue;
    }

    if (parsed.type === 'whitelist') {
      if (parsed.isValid && parsed.domain) {
        whitelist.push(parsed.domain);
      } else {
        // 格式无效的白名单（如 @@||not a domain）计入无效行，而非真实注释
        invalidCount++;
      }
      continue;
    }

    if (parsed.type === 'customDns') {
      if (parsed.isValid && parsed.domain && parsed.ip) {
        customDns.push({ domain: parsed.domain, ip: parsed.ip });
      } else {
        invalidCount++;
      }
      continue;
    }

    // 正则规则：保留原始 pattern 与来源语法，供生成阶段按目标格式转换
    if (parsed.type === 'regex') {
      if (parsed.pattern) {
        regexRules.push({
          pattern: parsed.pattern,
          source: parsed.regexSource ?? 'adguard',
          isException: parsed.regexException ?? false,
          originalLine: line
        });
      } else {
        invalidCount++;
      }
      continue;
    }

    if (parsed.type === 'hosts' || parsed.type === 'dnsmasq' || parsed.type === 'adguard' || parsed.type === 'domain') {
      if (parsed.isValid && parsed.domain) {
        domains.push(parsed.domain);
      } else {
        invalidCount++;
      }
      continue;
    }

    // 其余无法识别的行同样计入无效行
    invalidCount++;
  }

  // 尾段不足 PROGRESS_INTERVAL 行时补报 100%，避免进度条停在 <100%（T-P3-05）
  if (onProgress && total > 0) {
    onProgress(total, total);
  }

  return {
    raw: { domains, whitelist, customDns, regexRules },
    counters: { commentCount, invalidCount, totalLines: lines.length }
  };
};

// 全局后处理：跨行去重、白名单/自定义 DNS 剔除黑名单与统计组装。
// 必须在「全部分片聚合之后」整体执行一次，禁止按分片各自执行——
// 否则跨分片的白名单剔除与去重会漏算（并行等价契约，见 parseAggregate.test.ts）。
export const finalizeParsed = (
  raw: RawCollected,
  counters: RawCounters
): { data: ParsedData; stats: ParseStats } => {
  const { domains, whitelist, customDns, regexRules } = raw;
  const { commentCount, invalidCount } = counters;

  // 去重和处理冲突
  const whitelistSet = new Set(whitelist.map((w) => w.replace(/^\*\./, '')));
  // customDns 按 domain 去重（保留首次出现），避免生成重复 DNS 规则
  const seenCustomDns = new Set<string>();
  const uniqueCustomDns = customDns.filter((c) => {
    const key = c.domain.replace(/^\*\./, '');
    if (seenCustomDns.has(key)) return false;
    seenCustomDns.add(key);
    return true;
  });
  const customDnsSet = new Set(uniqueCustomDns.map((c) => c.domain.replace(/^\*\./, '')));
  const excludeSet = new Set([...whitelistSet, ...customDnsSet]);

  const filteredDomains = domains.filter((d) => !excludeSet.has(d.replace(/^\*\./, '')));
  const uniqueWhitelist = [...new Set(whitelist)];

  const stats: ParseStats = {
    domainCount: filteredDomains.length,
    validCount: filteredDomains.length + uniqueWhitelist.length,
    commentCount,
    blacklistCount: filteredDomains.length,
    whitelistCount: uniqueWhitelist.length,
    customDnsCount: uniqueCustomDns.length,
    totalLines: counters.totalLines,
    invalidCount
  };

  return {
    data: {
      domains: filteredDomains,
      whitelist: uniqueWhitelist,
      customDns: uniqueCustomDns,
      regexRules
    },
    stats
  };
};

// 解析源文本（hosts / dnsmasq / adguard / 无限界文本），输出结构化数据。
// 单线程整段解析 = collectLines + finalizeParsed；多核并行路径见
// workers/parseShard.worker.ts + hooks/useWorkerPool.ts，两者结果等价。
// onProgress 为可选进度回调；不传该参数时行为与此前完全一致，向后兼容。
export const parseSource = (
  text: string,
  onProgress?: (processed: number, total: number) => void
): { data: ParsedData; stats: ParseStats } => {
  const { raw, counters } = collectLines(text, onProgress);
  return finalizeParsed(raw, counters);
};
