// 临时内存基线测试（用完即删）
import { describe, it, expect } from 'vitest';
import { parseSource } from './parser';
import { generateSingleFormat } from './formatGenerators.single';
import { splitIntoShards } from './parseAggregate';

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

describe('memory baseline (large input)', () => {
  it('measures memory of parse + generate + shard for 500k lines', () => {
    const N = 500_000;
    const lines: string[] = [];
    for (let i = 0; i < N; i++) lines.push('0.0.0.0 ads' + i + '.example.com');
    const text = lines.join('\n');
    console.log('[mem] input chars MB =', mb(text.length));

    const base = process.memoryUsage().heapUsed;
    const { data } = parseSource(text);
    const afterParse = process.memoryUsage().heapUsed;
    console.log('[mem] after parse delta MB =', mb(afterParse - base), 'domains =', data.domains.length);

    const settings = {
      addHeader: true, blockIPv6: false, ipv4: '0.0.0.0', ipv6: '::',
      adguardIncludeWhitelist: false, dedupDomains: false, removeWildcard: false,
    } as any;
    const out = generateSingleFormat('hosts', data.domains, data.whitelist, data.customDns, settings, {} as any, data.regexRules);
    const afterGen = process.memoryUsage().heapUsed;
    console.log('[mem] after generate delta MB =', mb(afterGen - afterParse), 'out chars MB =', mb(out.length));

    const shards = splitIntoShards(text, 8);
    const afterSplit = process.memoryUsage().heapUsed;
    console.log('[mem] after splitIntoShards(8) delta MB =', mb(afterSplit - afterGen), 'shard0 chars MB =', mb(shards[0].length));

    const clones = shards.map((s) => s);
    const afterClone = process.memoryUsage().heapUsed;
    console.log('[mem] after 8-clone delta MB =', mb(afterClone - afterSplit));

    console.log('[mem] TOTAL heap MB =', mb(afterClone), ' (input was', mb(text.length), 'chars)');
    console.log('[mem] heap/start ratio ~', (afterClone / base).toFixed(1));
    expect(true).toBe(true);
  });
});
