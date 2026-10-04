// src/utils/buildFlowPool.test.ts v3.9.12
import { describe, it, expect } from 'vitest';
import { buildFlowPool } from './buildFlowPool';
import { ParsedData } from '../types';

describe('buildFlowPool', () => {
  it('samples domains, whitelist and custom DNS into visual flow pool', () => {
    const data: ParsedData = {
      domains: Array.from({ length: 20 }, (_, i) => `bad${i}.com`),
      whitelist: ['good1.com', 'good2.com'],
      customDns: [{ domain: 'router.lan', ip: '192.168.1.1' }],
    };

    const pool = buildFlowPool(data);
    const blockItems = pool.filter((item) => item.kind === 'block');
    const allowItems = pool.filter((item) => item.kind === 'allow');
    const dnsItems = pool.filter((item) => item.kind === 'dns');

    expect(blockItems.length).toBe(12); // capped at 12
    expect(allowItems.length).toBe(2);
    expect(dnsItems.length).toBe(1);
    expect(dnsItems[0].name).toBe('router.lan');
  });
});
