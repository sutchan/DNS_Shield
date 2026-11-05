// src/test-utils/rulesTestKit.ts v3.15.0
// useRules 测试套件共享装置：翻译表、基础设置、样例解析结果与测试辅助函数。
// 为满足单文件 ≤200 行约束，原 useRules.test.ts 按关注点拆分为
// generate / parse / interaction 三个测试文件，共用本装置。
// vitest.config.ts 已将 src/test-utils 排除出覆盖率统计范围。
import { vi } from 'vitest';
import { getTranslation } from '../utils/i18n';
import type { Settings, ParsedData, Translation } from '../types';

export const t = getTranslation('zh-cn') as Translation;

export const baseSettings: Settings = {
  projectName: 'DNS Shield',
  version: '3.15.0',
  ipv4: '127.0.0.1',
  ipv6: '::1',
  addHeader: true,
  blockIPv6: false,
  dedupDomains: true,
  removeWildcard: true,
  adguardIncludeWhitelist: true,
  showAllFormats: true,
  visibleFormats: [],
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt',
  unboundFilename: 'unbound.conf',
  piholeFilename: 'pihole.txt',
  domainsFilename: 'domains.txt',
  bindFilename: 'rpz.db',
  smartdnsFilename: 'smartdns.conf',
  mosdnsFilename: 'mosdns_domain_set.txt',
  clashFilename: 'clash_dns.yaml',
  corednsFilename: 'coredns_hosts.txt'
};

export const parsedData: ParsedData = {
  domains: ['ad.example.com', 'ads.example.net'],
  whitelist: ['api.example.com'],
  customDns: [{ domain: 'cdn.example.com', ip: '10.0.0.1' }],
  regexRules: []
};

/** 稳定的 showToast：生产代码中它是 useCallback，若每次渲染新建会使
 *  runGenerate 引用抖动、effect 反复触发，掩盖真实的惰性生成次数。 */
export const makeStableToast = (): ReturnType<typeof vi.fn> => vi.fn();

/** renderHook 暴露的 ref 为只读 RefObject；测试需注入真实 DOM 节点，
 *  故按既有范式断言为可变引用。 */
export const mutableRef = <T,>(ref: { current: T }): { current: T } => ref as { current: T };
