// src/utils/parser.ts v3.11.0
import { parseDomainLine, ParseStats } from './domainValidator';
import { CustomDnsEntry, ParsedData } from '../types';

// 进度回调触发间隔：每 N 行上报一次，避免高频回调拖慢解析（Worker 内 postMessage 有开销）
const PROGRESS_INTERVAL = 2000;

// 排序 / 去重职责抽离到 sortDedupe，保持公开 API 稳定
export { sortDomains, dedupeDomains } from './sortDedupe';

// 解析源文本（hosts / dnsmasq / adguard / 无限界文本），输出结构化数据。
// onProgress 为可选进度回调（供 Web Worker 分片上报解析进度）；
// 不传该参数时行为与此前完全一致，向后兼容。
export const parseSource = (
  text: string,
  onProgress?: (processed: number, total: number) => void
): { data: ParsedData; stats: ParseStats } => {
  const lines = text.split('\n');
  const total = lines.length;

  const domains: string[] = [];
  const whitelist: string[] = [];
  const customDns: CustomDnsEntry[] = [];
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
    totalLines: lines.length,
    invalidCount
  };

  return {
    data: {
      domains: filteredDomains,
      whitelist: uniqueWhitelist,
      customDns: uniqueCustomDns
    },
    stats
  };
};

