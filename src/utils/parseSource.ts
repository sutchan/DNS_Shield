// src/utils/parseSource.ts v3.7.61
// 解析完整源文本：按行解析并聚合统计，支持自定义域名/白名单「跨行混排补全」
// （以 @ / + 独占一行、下一行正式域名时合并为自定义解析/白名单）。
// 供预览与统计使用（parser.ts 的 parseSource 为逐行去重版，供规则生成，二者用途不同不合并）。

import { type ParseResult, type ParseStats } from '../types/formats';
import { isValidDomain, normalizeDomain } from './domainPrimitives';
import { parseDomainLine } from './parseLine';
import { buildParseStats } from './statsAggregator';

export interface ParseSourceResult {
  entries: ParseResult[];
  stats: ParseStats;
}

export const parseSource = (text: string): ParseSourceResult => {
  const lines = text.split('\n');
  const entries: ParseResult[] = [];
  let pendingCustom = '';
  let customAccum = '';
  let pendingWhitelist = '';
  let whitelistAccum = '';

  const flushAccum = (): void => {
    if (pendingCustom) {
      const d = normalizeDomain(pendingCustom);
      entries.push({ type: 'domain', domain: d, isValid: isValidDomain(d), originalLine: customAccum });
      pendingCustom = '';
      customAccum = '';
    }
    if (pendingWhitelist) {
      const d = normalizeDomain(pendingWhitelist);
      entries.push({ type: 'whitelist', domain: d, isValid: isValidDomain(d), originalLine: whitelistAccum });
      pendingWhitelist = '';
      whitelistAccum = '';
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const hashIndex = trimmed.indexOf('#');
    const isEmpty = !trimmed;
    const isComment = hashIndex === 0 || (hashIndex < 0 && trimmed.startsWith('!'));
    const content = hashIndex >= 0 ? trimmed.substring(0, hashIndex).trim() : trimmed;

    if (isEmpty || isComment || !content) {
      flushAccum();
      entries.push(parseDomainLine(line));
      continue;
    }

    // 自定义域名混排：以 @ 开头且独占一行，下一行正式域名时合并为自定义解析
    if (content.startsWith('@') && !content.includes('=')) {
      pendingCustom = content.slice(1).trim();
      customAccum = line;
      continue;
    }
    if (pendingCustom) {
      const domain = normalizeDomain(content);
      if (isValidDomain(domain) && !content.startsWith('@') && !content.startsWith('+')) {
        entries.push({ type: 'domain', domain, isValid: true, originalLine: `${customAccum}\n${line}` });
        pendingCustom = '';
        customAccum = '';
        continue;
      }
      flushAccum();
    }

    // 白名单混排：以 + 开头且独占一行，下一行域名时合并为白名单
    if (content.startsWith('+')) {
      pendingWhitelist = content.slice(1).trim();
      whitelistAccum = line;
      continue;
    }
    if (pendingWhitelist) {
      const domain = normalizeDomain(content);
      if (isValidDomain(domain) && !content.startsWith('@') && !content.startsWith('+')) {
        entries.push({ type: 'whitelist', domain, isValid: true, originalLine: `${whitelistAccum}\n${line}` });
        pendingWhitelist = '';
        whitelistAccum = '';
        continue;
      }
      flushAccum();
    }

    entries.push(parseDomainLine(line));
  }
  flushAccum();

  return { entries, stats: buildParseStats(entries) };
};
