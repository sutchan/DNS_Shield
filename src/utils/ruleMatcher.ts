// src/utils/ruleMatcher.ts v3.10.1
// 域名规则匹配分析器：根据当前黑名单、白名单与自定义 DNS 配置，
// 实时测试给定目标域名是否被拦截、豁免或重定向，并返回匹配的具体规则与判定逻辑。
import { ParsedData } from '../types';

export interface RuleMatchResult {
  query: string;
  normalizedDomain: string;
  action: 'whitelisted' | 'blocked' | 'customDns' | 'passed';
  matchedRule?: string;
  targetIp?: string;
  reasonKey: string;
}

/**
 * 规范化用户输入的测试域名或 URL
 * @param input 用户输入的测试字符串（可包含协议、端口或路径）
 * @returns 规范化的纯域名（小写，无空格）
 */
export function normalizeQueryDomain(input: string): string {
  if (!input) return '';
  let str = input.trim().toLowerCase();
  // 移除常见协议头
  str = str.replace(/^[a-zA-Z]+:\/\//, '');
  // 移除路径与查询参数
  str = str.split('/')[0];
  str = str.split('?')[0];
  str = str.split('#')[0];
  // 移除端口号
  str = str.split(':')[0];
  // 移除首尾点号与通配前缀
  str = str.replace(/^\*\./, '').replace(/^\.+|\.+$/g, '');
  return str;
}

/**
 * 判断目标域名是否匹配规则域名（支持全等匹配及子域名层级匹配）
 * @param queryDomain 待测试域名（如 sub.ad.example.com）
 * @param ruleDomain 规则中定义的域名（如 example.com 或 ad.example.com）
 */
export function isDomainMatch(queryDomain: string, ruleDomain: string): boolean {
  if (!queryDomain || !ruleDomain) return false;
  const cleanRule = ruleDomain.trim().toLowerCase().replace(/^\*\./, '').replace(/^\.+|\.+$/g, '');
  if (!cleanRule) return false;
  
  if (queryDomain === cleanRule) return true;
  if (queryDomain.endsWith(`.${cleanRule}`)) return true;
  return false;
}

/**
 * 匹配测试核心函数：按 白名单 -> 自定义DNS -> 黑名单 优先级匹配
 * @param query 待测域名或URL
 * @param parsedData 当前规则数据（包含黑名单、白名单、自定义DNS）
 */
export function matchDomainRule(query: string, parsedData: ParsedData): RuleMatchResult {
  const normalizedDomain = normalizeQueryDomain(query);
  
  if (!normalizedDomain) {
    return {
      query,
      normalizedDomain: '',
      action: 'passed',
      reasonKey: 'ruleTesterInvalidInput',
    };
  }

  // 1. 最高优先级：白名单豁免检查
  for (const white of parsedData.whitelist) {
    if (isDomainMatch(normalizedDomain, white)) {
      return {
        query,
        normalizedDomain,
        action: 'whitelisted',
        matchedRule: white,
        reasonKey: 'ruleTesterMatchWhitelist',
      };
    }
  }

  // 2. 次高优先级：自定义 DNS 检查
  for (const custom of parsedData.customDns) {
    if (isDomainMatch(normalizedDomain, custom.domain)) {
      return {
        query,
        normalizedDomain,
        action: 'customDns',
        matchedRule: custom.domain,
        targetIp: custom.ip,
        reasonKey: 'ruleTesterMatchCustomDns',
      };
    }
  }

  // 3. 黑名单拦截检查
  for (const black of parsedData.domains) {
    if (isDomainMatch(normalizedDomain, black)) {
      return {
        query,
        normalizedDomain,
        action: 'blocked',
        matchedRule: black,
        reasonKey: 'ruleTesterMatchBlacklist',
      };
    }
  }

  // 4. 未命中任何规则，正常放行
  return {
    query,
    normalizedDomain,
    action: 'passed',
    reasonKey: 'ruleTesterMatchPassed',
  };
}
