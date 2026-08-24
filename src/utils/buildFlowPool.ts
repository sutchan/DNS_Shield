// src/utils/buildFlowPool.ts v3.9.1
// 从解析后的域名数据构建流量可视化 token 抽样池。
// 按原型比例抽取：黑名单 12 个、白名单 6 个、改道 4 个，保持三态视觉比例。
import { ParsedData } from '../types';

export interface FlowPoolItem {
  name: string;
  kind: 'block' | 'allow' | 'dns';
}

const SAMPLE_LIMITS: Record<FlowPoolItem['kind'], number> = {
  block: 12,
  allow: 6,
  dns: 4,
};

function pushItems(pool: FlowPoolItem[], source: readonly string[], kind: FlowPoolItem['kind'], limit: number) {
  for (let i = 0; i < limit && i < source.length; i += 1) {
    pool.push({ name: source[i], kind });
  }
}

export function buildFlowPool(parsedData: ParsedData): FlowPoolItem[] {
  const pool: FlowPoolItem[] = [];
  pushItems(pool, parsedData.domains, 'block', SAMPLE_LIMITS.block);
  pushItems(pool, parsedData.whitelist, 'allow', SAMPLE_LIMITS.allow);
  pushItems(pool, parsedData.customDns.map((entry) => entry.domain), 'dns', SAMPLE_LIMITS.dns);
  return pool;
}
